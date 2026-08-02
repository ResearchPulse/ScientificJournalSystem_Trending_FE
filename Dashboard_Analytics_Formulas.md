# Công Thức & Logic Tính Toán Biểu Đồ Hệ Thống (Trending Project)

Tài liệu này mô tả chi tiết cách luồng dữ liệu di chuyển từ Backend đến Frontend và công thức toán học/logic trích xuất dữ liệu cho các biểu đồ phân tích.

---

## PHẦN 1: Luồng Xử lý Dữ liệu Tổng quát (Data Flow)

> [!NOTE]
> Cách hệ thống xử lý tính toán khối lượng dữ liệu khổng lồ (hàng trăm ngàn bài báo) mà không bị nghẽn (bottleneck).

1. **Frontend Request:** Người dùng thao tác trên giao diện (chọn bộ lọc, đổi năm, chọn dự án). React (thông qua `react-query` và `axios`) gọi API lên Backend (vd: `GET /analytics/journal-ranking?project_id=29`).
2. **Backend Validation & Scope Resolution:** 
   - Middleware Zod kiểm tra tính hợp lệ của tham số.
   - Hàm `getResolvedScope` sẽ tra cứu CSDL để lấy toàn bộ danh sách `topic_id` và `subject_category_id` thuộc phạm vi của Dự án số 29. Việc này giúp thu hẹp (filter) không gian tính toán thay vì phải query trên toàn bộ database.
3. **Bộ nhớ đệm (Redis Caching):** 
   - Backend tạo một `cacheKey` duy nhất từ các tham số bộ lọc. 
   - Nếu dữ liệu biểu đồ này đã được tính toán trong vòng 12 giờ qua, Backend lập tức lấy từ Redis trả về cho Frontend (thời gian phản hồi cực nhanh < 20ms).
4. **Tính toán Database Aggregation (Nếu Cache Miss):**
   - Backend thực thi một câu lệnh SQL phức tạp sử dụng kỹ thuật `CTE` (Common Table Expressions) như `WITH target_topics AS (...)` để gộp nhiều bảng: `Article` -> `Sub_Topic` -> `Issue` -> `Volume` -> `Journal`.
   - PostgreSQL thực hiện các phép toán nhóm `GROUP BY`, đếm `COUNT(DISTINCT)`, tính tổng `SUM()`, và tìm ra giá trị ranking mới nhất bằng `WINDOW FUNCTIONS` (vd: `ROW_NUMBER() OVER(PARTITION BY...)`).
5. **Formatting & Caching:** 
   - Kết quả thô từ Database được Backend chuyển đổi (map) thành định dạng JSON chuẩn mực (mảng các Object có cấu trúc).
   - Lưu JSON này vào Redis (thường là 12 tiếng) để phục vụ các yêu cầu giống hệt trong tương lai, sau đó trả về HTTP 200 cho Frontend.
6. **Frontend Rendering:** React nhận JSON và truyền thẳng vào Props của các component biểu đồ (sử dụng các thư viện như Recharts, Nivo, ECharts), tự động sinh ra các đồ thị trực quan cho người dùng.

---

## PHẦN 2: Biểu đồ trang Tạp chí (Journals Analytics)

### 1. Phân phối Tứ phân vị (Quartile Distribution)
- **Logic thu thập:** Lọc tất cả các bài báo thuộc Dự án, truy ngược ra danh sách các Tạp chí duy nhất. Gọi vào bảng `Journal_Ranking` để lấy thứ hạng Tứ phân vị (cột `value_txt` của hệ đo lường `SJR_BEST_QUARTILE` có giá trị Q1, Q2, Q3, Q4) của các tạp chí này trong những năm được chọn.
- **Tính toán:** Nhóm theo Tứ phân vị, sau đó đếm tổng số tạp chí duy nhất nằm trong từng nhóm Q1, Q2, Q3, Q4. 
- **Trên Frontend:** Biểu đồ Donut tính toán tỷ trọng phần trăm theo công thức: 
  `% = Math.round((Số lượng tạp chí Qx / Tổng số tạp chí) * 100)`.

### 2. Xếp hạng Tạp chí Hàng đầu (Top Journal Ranking)
- **Logic thu thập:** Backend tính toán 2 thông số chính cho mỗi Tạp chí:
  - `impactFactor` (SJR): Lấy từ bảng `Journal_Ranking` với mã `SJR` (SJR Index) của năm mới nhất.
  - `article_count`: Đếm tổng số bài báo thuộc phạm vi dự án đã được đăng trên tạp chí này.
- **Sắp xếp (Sorting):** CSDL tự động `ORDER BY` các tạp chí giảm dần theo `impactFactor` (mức độ ảnh hưởng), nếu bằng nhau sẽ xét đến `article_count` (số lượng xuất bản).
- **Trên Frontend:** Biểu đồ Bar Chart hiển thị Top 5 tạp chí đứng đầu. Thanh biểu đồ hiển thị mức độ tác động tổng hợp (*Weighted Impact Factor*).

### 3. Ma trận Tác động (Impact Matrix)
- **Logic thu thập:** Hệ thống trích xuất đồng thời 2 chỉ số độc lập cho từng Tạp chí trong năm được chọn:
  - Chỉ số **SJR** (làm Trục X).
  - Chỉ số **H-Index** (làm Trục Y).
  Chỉ những tạp chí có tồn tại số liệu của cả 2 chỉ số này (lớn hơn 0) mới được đẩy vào ma trận.
- **Trên Frontend:** Vẽ biểu đồ phân tán (Scatter Plot). Mỗi dấu chấm đại diện cho 1 tạp chí. Tọa độ của nó là `(SJR, H-Index)`. Frontend sẽ tự tô màu và gộp nhóm các dấu chấm này dựa trên Tứ phân vị (Q1 màu đậm, Q2, Q3 màu nhạt dần) để người dùng dễ nhìn thấy sự hội tụ chất lượng.

### 4. Phân tích Dịch chuyển (Migration Analysis - Open Access)
- **Logic thu thập:** Đây là biểu đồ luồng chảy mô phỏng xu hướng chuyển dịch mô hình kinh doanh của các Tạp chí khoa học từ Thu phí sang Miễn phí (Mở). 
- **Công thức luồng (Sankey Flow):**
  - Mặc định điểm xuất phát (`source_access_model`) của mọi tạp chí giả định là mô hình Truyền thống (Đăng ký mua / **SUBSCRIPTION**).
  - Hệ thống kiểm tra cờ `is_open_access` của từng Tạp chí. Nếu `true`, đích đến (`target_access_model`) là **FULL_OPEN_ACCESS** (Truy cập mở hoàn toàn). Nếu `false`, đích đến giữ nguyên là **LEGACY_MODEL** (Mô hình truyền thống).
- **Tính toán & Hiển thị:** Đếm số lượng đường truyền (flows) chạy từ Trái sang Phải. Dưới góc biểu đồ có Tỷ lệ chuyển đổi:
  `Tỷ lệ = (Số lượng tạp chí Open Access / Tổng số tạp chí) * 100` (%)

---

## PHẦN 3: Biểu đồ trang Chỉ số Tạp chí - Mạng lưới (Journal Metrics - Collaboration)

### 1. Tác giả có tầm ảnh hưởng hàng đầu (Top Influential Authors)
- **Logic thu thập:** Tính toán điểm ảnh hưởng (Impact Score) cho từng Tác giả dựa trên 3 thông số:
  - `article_count`: Số lượng bài báo nằm trong phạm vi tìm kiếm.
  - `citation_count`: Tổng số trích dẫn từ các bài báo đó.
  - `h_index`: Chỉ số H-index của tác giả.
- **Công thức điểm thô (Raw Score):** `Raw_Score = (article_count * 0.3) + (citation_count * 0.5) + (h_index * 0.2)`
- **Chuẩn hóa (Normalization):** Điểm được chuẩn hóa về thang 0-100 (Min-Max Normalization). Tác giả dẫn đầu sẽ đạt điểm tuyệt đối là 100.0 Điểm Ảnh hưởng.
- **Trên Frontend:** Hiển thị danh sách các tác giả xếp hạng giảm dần theo điểm đã chuẩn hóa.

### 2. Tổ chức nghiên cứu hàng đầu (Top Research Institutions)
- **Logic thu thập:** Tính điểm hiệu suất nghiên cứu cho từng Tổ chức dựa trên lượng xuất bản và trích dẫn.
- **Công thức điểm thô (Raw Score):** Dựa trên 2 thông số trọng số chính: 
  `Raw_Score = (article_count * 0.4) + (citation_count * 0.6)`
- **Chuẩn hóa:** Tương tự thuật toán tính điểm tác giả, điểm được chuẩn hóa về thang điểm 0-100 (Điểm Trích dẫn) và hiển thị trên giao diện xếp hạng giảm dần.

### 3. Ma trận so sánh Hiệu suất & Tầm ảnh hưởng của Tác giả (Productivity vs Impact Matrix)
- **Logic thu thập:** Trích xuất 2 tọa độ trực quan cho mỗi tác giả:
  - Trục Y (Tầm ảnh hưởng / Impact): Lấy trực tiếp chỉ số **H-Index** (`hIndex`) của tác giả.
  - Trục X (Hiệu suất / Productivity): Được định nghĩa là Sản lượng trung bình năm (`yearlyOutput`). 
    - *TH1 (Có chọn khoảng năm):* Công thức là `Tổng số bài báo / Số năm được chọn`.
    - *TH2 (Không chọn năm):* Hệ thống tự động tìm năm gần nhất mà tác giả có xuất bản bài báo và lấy số lượng xuất bản của riêng năm đó.
- **Trên Frontend:** Vẽ biểu đồ Scatter Plot. Các tác giả nằm ở góc trên bên phải là những người lý tưởng nhất: Vừa viết nhiều (Năng suất cao) vừa có chỉ số H-index lớn (Ảnh hưởng sâu rộng).

### 4. Nhận định khoa học cốt lõi (Core Scientific Insights)
- **Logic thu thập:** Đưa ra các con số tổng quát (Aggregated Metrics) đại diện cho sức khỏe của hệ sinh thái nghiên cứu.
  - **Số lượng liên kết (Collabs):** Đếm số lượng cặp tổ chức nghiên cứu có hợp tác cùng nhau trên ít nhất 1 bài báo (`collabCount`). 
  - **AVG GROWTH IN JOINT VENTURES:** Đo lường sự gia tăng của các bài báo hợp tác (do từ 2 tổ chức trở lên đồng tác giả). 
    > `Công thức = Số bài báo hợp tác năm nay / Số bài báo hợp tác năm liền trước` (Kết quả hiển thị dạng hệ số nhân, ví dụ: 1.5x).
  - **INTER-DISCIPLINARY CROSS-OVER:** Đo lường tỷ lệ nghiên cứu mang tính liên ngành. 
    > `Công thức = (Số bài báo có chứa Sub_Topic / Tổng số bài báo) * 100%`.
  - **OPEN ACCESS RATE:** Tỷ lệ truy cập mở của toàn bộ bài báo trong dự án. 
    > `Công thức = (Số bài báo đăng trên tạp chí Open Access / Tổng số bài báo) * 100%`.

---

## PHẦN 4: Biểu đồ trang Tổng quan (Dashboard Analytics)

### 0. Thẻ thống kê Hệ sinh thái toàn cầu (Global Ecosystem Summary Cards)
- **Logic thu thập:** Backend đếm tổng số lượng thực thể (Authors, Institutions) tham gia vào toàn bộ mạng lưới xuất bản trong phạm vi dự án. Đối với "Chỉ số mật độ" (Density Index), sử dụng thuật toán tính toán mật độ của mạng lưới liên kết (Network Density). Đối với "Đã dịch chuyển" (Shifted), tính toán hệ số Entropy để đo mức độ thay đổi cấu trúc của chủ đề.
- **Tính toán Tăng trưởng (Sparkline):** Trích xuất chuỗi dữ liệu (time-series data) theo thời gian để vẽ biểu đồ Sparkline nhỏ bên dưới mỗi con số, đồng thời so sánh dữ liệu hiện tại với chu kỳ trước để hiển thị trạng thái (ví dụ: `Ổn định` hoặc giảm/tăng bao nhiêu %).
- **Trên Frontend:** Hiển thị dưới dạng một hàng (Row) gồm 4 Card nổi bật nằm trên cùng của giao diện Hệ sinh thái toàn cầu.

### 1. Bản đồ nhiệt địa lý (Geo Distribution)

> [!NOTE]
> Hiển thị mật độ sản lượng nghiên cứu toàn cầu theo phân vùng quốc gia.

- **Cách thu thập dữ liệu:** 
  Hệ thống lấy tất cả các Bài báo (Article) nằm trong phạm vi dự án hiện tại. Thông qua các Tác giả (Author), hệ thống dò tìm ra Tổ chức (Institution) mà tác giả đó đang công tác và lấy mã quốc gia (`country_code`) của tổ chức đó.
- **Tính tổng:** 
  Đếm tổng số lượng bài báo duy nhất (`COUNT(DISTINCT article_id)`) phân bố theo từng Quốc gia.
- **Công thức Phân loại Cường độ (Intensity):** 
  Sau khi đếm xong, các quốc gia được sắp xếp **giảm dần** theo số lượng bài báo. Thuật toán sẽ tính toán **phân vị (Percentile)** của từng quốc gia trong danh sách để gán màu sắc/cường độ trên bản đồ:
  - **`PEAK`** (Màu đậm nhất): Top **10%** quốc gia dẫn đầu.
  - **`HIGH`**: Thuộc Top **10% - 30%**.
  - **`MEDIUM`**: Thuộc Top **30% - 60%**.
  - **`LOW`** (Màu nhạt nhất): Nhóm **40%** quốc gia còn lại ở cuối bảng.

### 2. Tổng quan Nghiên cứu (Research Overview / Distribution)

> [!NOTE]
> Biểu đồ dạng Treemap hiển thị tỷ trọng các chủ đề nghiên cứu nổi bật nhất.

- **Cách thu thập dữ liệu:** 
  Hệ thống gom nhóm (Group By) tất cả bài báo theo **Chủ đề chính** (`primary_topic`). Sau đó đếm tổng số lượng bài báo cho mỗi Chủ đề.
- **Công thức tính Phần trăm (%):** 
  `Phần trăm = Math.round((Số lượng bài báo của Chủ đề / Tổng số bài báo) * 100)`
- **Luồng xử lý hiển thị Treemap:** 
  Biểu đồ này không hiển thị tất cả các chủ đề. Code Backend mặc định chỉ lấy **Top 3 Chủ đề** có tỷ lệ cao nhất. 
  
  > [!TIP]
  > **Thuật toán bù trừ sai số:** Phần trăm của tất cả các chủ đề còn lại (nằm ngoài top 3) sẽ được cộng gộp thành một khối **"Others"**. Nếu có sai số do làm tròn khiến tổng không tròn 100%, lượng % dư/thiếu sẽ được tự động cộng dồn vào khối "Others" hoặc "Top 1" để đảm bảo biểu đồ lúc nào cũng hiển thị chính xác tổng là **100%**.

### 3. Thực thể Hàng đầu (Top Entities / Institutions)

> [!NOTE]
> Biểu đồ xếp hạng các Tổ chức, Trường Đại học hoặc Trung tâm Nghiên cứu xuất sắc nhất dựa trên hiệu suất tổng hợp.

Điểm số hiển thị (ví dụ: Google DeepMind 100, New York Genome Center 21.1) được tính qua 2 bước:

- **Bước 1: Tính điểm thô (Raw Score) dựa trên trọng số:**
  Đánh giá dựa trên 3 chỉ số: Số lượng bài báo (trọng số 0.4), Tổng số trích dẫn (trọng số 0.5) và chỉ số H-index trung bình (trọng số 0.1).
  ```javascript
  Raw_Score = (Article_Count * 0.4) + (Citation_Count * 0.5) + (H_index * 0.1)
  ```

- **Bước 2: Chuẩn hóa điểm về thang 0-100 (Min-Max Normalization):**
  Hệ thống tìm ra Tổ chức có điểm thô cao nhất (`Max`) và thấp nhất (`Min`). Tổ chức cao nhất mặc định sẽ được làm tròn lên **100 điểm** (như Google DeepMind). Điểm của các tổ chức khác được quy chiếu theo khoảng cách so với `Max`.
  ```javascript
  Score = ((Raw_Score - Min) / (Max - Min)) * 100
  ```
  *(Kết quả được làm tròn đến 1 chữ số thập phân)*.

### 4. Tứ phân vị Tác động (Impact Quartile) - Phiên bản rút gọn
Đây là biểu đồ tóm tắt của "Phân phối Tứ phân vị" đã nói ở Phần 2. Điểm khác biệt là vòng Donut ở trang chủ sẽ chỉ ưu tiên tô màu và hiển thị con số % của Tứ phân vị cao nhất (ví dụ nhóm Q1 chiếm cao nhất thì chỉ hiện thị chữ Q1 39% ở chính giữa vòng tròn).

---

## PHẦN 5: Biểu đồ trang Xu hướng & Phát triển (Trends & Development)

Trang này thực hiện 4 phân hệ phân tích (modules) chạy song song (`Promise.all`) để giảm thiểu độ trễ tính toán. 

### 1. Xu hướng Công bố (Publication Trend)
- **Logic thu thập:** Đếm tổng số bài báo xuất bản theo từng năm trong khoảng thời gian được chọn (thường là 5 năm qua).
- **Tính toán Tăng trưởng (Growth Rate YoY):** 
  Lấy số lượng bài báo của năm gần nhất (`currentVal`) và năm liền kề trước đó (`previousVal`).
  > `Tỷ lệ YoY (%) = Math.round(((currentVal - previousVal) / previousVal) * 100)`
- **Trên Frontend:** Biểu đồ miền (Area chart) vẽ đường xu hướng sản lượng qua các năm. Hiển thị % tăng trưởng ở góc phải trên cùng (như trong ảnh là -61.7% YoY).

### 2. Đối chiếu Trích dẫn (Citation Comparison)
- **Logic thu thập:** Sử dụng Graph Database (Neo4j) quét các mối quan hệ trích dẫn `(Article)-[REFERENCES]->(Article)` để phân tích tính nội bộ/ngoại lai.
- **Phân loại Nội bộ / Bên ngoài:**
  - **Trích dẫn nội bộ (Self / Internal):** Xác định khi có ít nhất một tác giả nằm ở cả Bài báo đi trích dẫn và Bài báo bị trích dẫn. Code Neo4j: `EXISTS { (a)<-[:WRITES]-(:Author)-[:WRITES]->(b) }`.
  - **Trích dẫn bên ngoài (External):** Không có sự trùng lặp tác giả nào giữa 2 bài báo.
- **Trên Frontend:** Biểu đồ đường (Line chart) với 2 dải màu phân biệt, thể hiện tổng số lượng trích dẫn nội bộ và bên ngoài thay đổi thế nào theo từng năm.

### 3. Sự Tiến hóa Chủ đề (Topic Evolution)
- **Logic thu thập:** Sử dụng PostgreSQL để tìm ra **Top 3 Chủ đề (Topics)** nổi bật nhất dựa trên tổng số lượng bài báo xuất bản trong giai đoạn.
- **Tính toán & Phân loại:** 
  - Đếm chi tiết số bài báo của 3 chủ đề này theo từng năm để vẽ sóng biểu đồ.
  - Tính tỷ trọng phần trăm của mỗi chủ đề so với toàn bộ dự án: `(Tổng số bài của Chủ đề / Tổng số bài toàn dự án) * 100`.
  - Phân loại trạng thái chu kỳ (Emerging / Expanding / Stable) để hiển thị nhãn text bên dưới biểu đồ.
- **Trên Frontend:** Biểu đồ dạng luồng (Stream/Area chart) mô phỏng độ phình to hay thu hẹp của 3 chủ đề lớn nhất theo dòng thời gian.

### 4. Phát hiện Tiên phong (Pioneer / Frontier Detection)
- **Logic thu thập:** Quét các chủ đề bằng Graph DB (Neo4j), đếm tổng số bài báo (`articleCount`) và tổng số lượng bị trích dẫn (`citationCount`).
- **Tính toán 2 hệ tọa độ (X, Y):**
  - **Chỉ số Tác động (Impact Factor - Trục Y):** Tính bằng `citationCount / articleCount` (Số trích dẫn trung bình/1 bài báo). Điểm này sau đó được chuẩn hóa (Scale) về thang điểm tối đa là 10.0 để vẽ lên biểu đồ.
  - **Tốc độ Trích dẫn (Citation Velocity - Trục X):** Đo lường thứ hạng phần trăm (percentile rank) lượng trích dẫn của chủ đề này so với các chủ đề khác. Điểm được quy đổi vào thang đo chuẩn từ 3.0 đến 9.5 điểm.
- **Phân loại Trạng thái Tiên phong:** 
- Nếu `Impact Factor >= 3.0` VÀ `Citation Velocity >= 5.0` -> Đánh giá là **FRONTIER** (Tiên phong / Đi đầu).
  - Các trường hợp còn lại -> Đánh giá là **EMERGING** (Mới nổi).
- **Trên Frontend:** Biểu đồ Scatter Plot định vị các chủ đề. Các chủ đề màu cam đậm (Tiên phong) sẽ hội tụ ở khu vực góc trên bên phải của không gian đồ thị (nơi có Tốc độ trích dẫn cao và Tác động lớn nhất).

### 5. Dự báo Xu hướng Tương lai (Future Trend Forecasting)
- **Logic thu thập:** Sử dụng các mô hình học máy (Machine Learning/AI) dự kiến tích hợp, hoặc các thuật toán ngoại suy tuyến tính (Linear Extrapolation) trên nền dữ liệu chuỗi thời gian (time-series) của 5-10 năm quá khứ.
- **Tính toán:** Phân tích độ dốc (slope) của sự tăng trưởng tần suất xuất hiện từ khóa, kết hợp với biến động của lượng trích dẫn để vẽ ra một đường dự báo (forecast line) kèm theo khoảng tin cậy (confidence interval) trong 3-5 năm tới.
- **Trên Frontend:** (Khu vực đang chờ dữ liệu) Sẽ hiển thị một biểu đồ đường (Line chart) với nét đứt đại diện cho dữ liệu dự báo tương lai, giúp định hình quỹ đạo của các chủ đề lõi.

---

## PHẦN 6: Biểu đồ trang Từ khóa & Mạng lưới (Keywords & Networks)

Trang này tập trung vào phân tích mối quan hệ hợp tác và sự tiến hóa của các cụm từ khóa/khái niệm. Dữ liệu được tính toán qua nhiều module khác nhau.

### 1. Cụm chủ đề cốt lõi & Véc-tơ Xu hướng Từ khóa
- **Logic thu thập:** Backend tính toán khối lượng bài báo (`volume`) của từng từ khóa trong 2 giai đoạn: Giai đoạn hiện tại (vd: 12 tháng qua) và Giai đoạn trước đó (vd: 12 tháng trước đó). 
- **Công thức Tăng trưởng (Growth YoY):** 
  `Growth = ((Khối lượng hiện tại - Khối lượng trước đó) / Khối lượng trước đó) * 100`
- **Trên Frontend:** 
  - **Cụm chủ đề cốt lõi (Core Clusters):** Bóc tách Từ khóa đứng Top 1 (tăng trưởng cao nhất). Hiển thị khối lượng, tên từ khóa, và một thanh tiến trình (Progress Bar) phần trăm so với mốc tối đa.
  - **Véc-tơ Xu hướng Từ khóa (Trend Vectors):** Lấy danh sách Top 10 từ khóa mạnh nhất, vẽ biểu đồ cột (Bar Chart) thể hiện động lượng (momentum) tăng trưởng của chúng.

### 2. Biểu đồ Dây Hợp tác Quốc gia (Country Collaboration Chord)
- **Logic thu thập:** Lọc tất cả bài báo, dò tìm Tổ chức (Institution) của các Tác giả để lấy ra Quốc gia (Country). Nếu một bài báo có tác giả từ 2 quốc gia trở lên (vd: Việt Nam, Mỹ, Nhật), hệ thống tách ra thành các cặp hợp tác: (Việt Nam - Mỹ), (Việt Nam - Nhật), (Mỹ - Nhật).
- **Tính toán:** Đếm số lần xuất hiện (`coAuthorshipValue`) của từng cặp. Thuật toán sẽ tính tổng "Sức mạnh hợp tác" của từng quốc gia, và chỉ giữ lại Top N Quốc gia hàng đầu, đồng thời loại bỏ các cặp có tần suất quá nhỏ (`minValue`). Tăng trưởng YoY của từng cặp cũng được tính bằng cách so sánh với số liệu chu kỳ trước.
- **Trên Frontend:** Vẽ biểu đồ Chord (Dây cung) kết nối các quốc gia. Bên cạnh là danh sách các "Liên kết hợp tác chính" được sắp xếp giảm dần, kèm % tăng trưởng.

### 3. Phân tích Liên kết Hợp tác (Collaboration Link Analysis)
- **Logic thu thập:** Backend tổng hợp insight dạng text (chữ) dựa trên dữ liệu mạng lưới:
  - Dò tìm cặp quốc gia có mức tăng trưởng hợp tác cao nhất để sinh ra câu nhận định: *"Global research output has shifted significantly..."*
  - **Liên kết mới nổi (Emerging Link):** Lấy từ khóa tăng trưởng mạnh nhất (Top 1) và ghép với một khối định danh (ví dụ: BRICS + Khái niệm).
  - **Nút quan trọng (Critical Node):** Lấy từ khóa nổi bật thứ 2 làm nút thắt quan trọng trong mạng lưới.

### 4. Độ gần gũi Khái niệm (Concept Proximity)
- **Logic thu thập:** Trích xuất Mạng lưới Khái niệm (Conceptual Network). Các "Nút" (Nodes) là Từ khóa. Nếu 2 từ khóa cùng xuất hiện trong 1 bài báo, chúng sẽ được nối với nhau bằng một "Cạnh" (Edge - `CONCEPTUAL_PROXIMITY`).
- **Trên Frontend:** Vẽ đồ thị mạng (Network Graph). Các từ khóa thường xuyên đi chung với nhau sẽ bị lực hút kéo lại gần thành các cụm (Clusters). Kích thước của Nút phản ánh tổng số lượng bài báo chứa từ khóa đó.

### 5. Liên kết chéo Lĩnh vực (Cross-domain Links)
- **Logic thu thập:** Nhằm đánh giá mức độ nghiên cứu liên ngành. Hệ thống lọc bài báo, sau đó đếm xem mỗi bài báo thuộc bao nhiêu Chuyên ngành (Subject Category) khác nhau.
- **Công thức tính Tỷ lệ liên kết:** 
  Đếm số bài báo thuộc từ 2 chuyên ngành trở lên (`crossArticles`). 
  `Tỷ lệ (%) = Math.round((crossArticles / Tổng số bài báo) * 100)`
- **Trên Frontend:** Hiển thị con số % (Ví dụ: 74% bài báo có tính chất liên ngành).

### 6. Dịch chuyển Cụm theo Thời gian (Cluster Migration over Time)
- **Logic thu thập:** 
  - Backend tìm ra Top 7 Từ khóa lớn nhất trong 8 năm qua.
  - Đếm số lượng bài báo của 7 từ khóa này cho từng năm để tạo thành một ma trận/lưới 7x8 = 56 ô.
  - Khối lượng của từng ô được đối chiếu với ô cao nhất (`maxVol`) để quy đổi thành Cường độ màu (Intensity) từ `0.1` đến `1.0`.
- **Tính toán Drift Entropy:** Đo lường độ ổn định của xu hướng bằng cách tính tỷ lệ số lượng bài báo giữa 2 chuyên ngành dẫn đầu. Nếu tỷ lệ > 2, Entropy là LOW (Ổn định). Nếu < 1.2 là HIGH (Hỗn loạn).
- **Trên Frontend:** Vẽ biểu đồ Heatmap (Bản đồ nhiệt), thể hiện sự "đậm lên" hoặc "nhạt đi" của các cụm từ khóa qua từng năm, giúp nhận diện sự dịch chuyển trọng tâm nghiên cứu.

### 7. Tạp chí Đang theo dõi (Tracked Journals & IP Average)
- **Logic thu thập:** Backend truy vấn danh sách Tạp chí mà người dùng đã bấm "Theo dõi" (Watch-list). 
  - Trả về Lịch sử Chỉ số Tác động (Impact Factor History) trong 5 năm gần nhất dưới dạng mảng (Array) để Frontend vẽ biểu đồ Sparkline (Xu hướng).
- **Công thức Điểm IP Trung bình (Average IP Score):** 
  Tính tổng chỉ số Impact Factor hiện tại của tất cả các tạp chí đang theo dõi, chia cho tổng số lượng tạp chí đang theo dõi. 
  `IP Trung bình = Tổng IF / Số lượng tạp chí đang theo dõi`
- **Quản lý Hạn mức (Tracking Limit):** 
  Đếm tổng số Tạp chí so với Giới hạn tối đa (vd: 150). Nếu vượt quá, hệ thống sẽ cảnh báo bằng thanh ProgressBar (màu cam/đỏ).
- **Trên Frontend:** Hiển thị danh sách các tạp chí theo dạng bảng (Table) kết hợp biểu đồ Sparkline, và 3 Card tóm tắt ở dưới cùng (Điểm IP Trung bình, Hạn mức theo dõi, Trạng thái Auto-refresh).
