# Mục đích và Công dụng của các Biểu đồ Analytics trong Hệ thống Scientific Journal

Tài liệu này trình bày chi tiết ý nghĩa và giá trị thực tiễn của từng loại biểu đồ phân tích trên Dashboard. Mục tiêu là giúp các nhà nghiên cứu (Researcher), người quản lý dự án (Project Manager - PM) và các cơ sở giáo dục tối ưu hóa quy trình ra quyết định, từ định hướng nghiên cứu đến quy hoạch chiến lược.

---



## 1. Biểu đồ Phân phối Tứ phân vị (Quartile Distribution)

Mục đích chính của biểu đồ Phân phối Tứ phân vị là giúp các nhà nghiên cứu, người quản lý dự án hoặc các cơ sở giáo dục đánh giá được chất lượng, độ uy tín và xu hướng chất lượng của các tạp chí trong một lĩnh vực nghiên cứu cụ thể (ví dụ: ngành Computer Science).

Tứ phân vị (Quartiles) - thường dựa trên hệ thống SCImago (SJR) hoặc Journal Citation Reports (JCR) - chia tất cả các tạp chí trong một ngành thành 4 nhóm bằng nhau (mỗi nhóm 25%) dựa trên chỉ số ảnh hưởng (Impact Factor/SJR) của chúng:

* **Q1 (Tác động Cao - Top 25%):** Đây là những tạp chí uy tín nhất, xuất sắc nhất và có tầm ảnh hưởng lớn nhất trong ngành. Được đăng bài ở Q1 là mục tiêu cao nhất của các nhà khoa học.
* **Q2 (Trung bình - Từ 25% đến 50%):** Các tạp chí có chất lượng tốt, uy tín cao và được công nhận rộng rãi.
* **Q3 (Tiêu chuẩn - Từ 50% đến 75%):** Các tạp chí đạt chuẩn mực khoa học, thường là sân chơi cho các nghiên cứu ở mức độ vừa phải hoặc mang tính địa phương/khu vực.
* **Q4 (Đang phát triển - Nhóm 25% cuối cùng):** Các tạp chí mới nổi, quy mô nhỏ hoặc có độ ảnh hưởng thấp nhất trong danh mục được đánh giá.

Dựa vào việc nhìn vào biểu đồ này trên hệ thống, người dùng sẽ giải quyết được 3 bài toán lớn:

1. **Đánh giá chất lượng của ngành/chủ đề nghiên cứu (Domain Assessment)**
Nếu biểu đồ cho thấy tỷ trọng Q1 (màu cam) chiếm rất lớn (ví dụ 39%), điều này có nghĩa là lĩnh vực đang có chất lượng học thuật rất cao, các công bố chủ yếu tập trung ở các tạp chí hàng đầu. Ngược lại, nếu Q3 và Q4 chiếm ưu thế, lĩnh vực đó có thể đang ở giai đoạn sơ khai hoặc chất lượng nghiên cứu chung chưa cao.

2. **Chiến lược xuất bản (Publication Strategy)**
Khi một nhà nghiên cứu chuẩn bị gửi bài, họ sẽ nhìn vào phổ phân bố này để chọn "bến đỗ" phù hợp:
   * Muốn lấy tiếng tăm, điểm phong học hàm/học vị, hoặc xin tài trợ (Grant): Họ sẽ nhắm thẳng vào nhóm Q1, Q2.
   * Cần bài viết được publish nhanh, dễ thở hơn (ví dụ để kịp tốt nghiệp): Họ sẽ khoanh vùng các tạp chí thuộc nhóm Q3, Q4.

3. **Đánh giá hiệu suất của Dự án/Tổ chức (Performance Evaluation)**
Nếu Project của bạn không chỉ là theo dõi một "Ngành" mà là theo dõi "Các bài báo do tổ chức/trường đại học của tôi xuất bản", biểu đồ này chính là KPI học thuật. Một trường đại học có 80% bài báo nằm ở Q1, Q2 chắc chắn uy tín hơn một trường có 80% bài báo nằm ở Q4.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Lọc tất cả các bài báo thuộc Dự án, truy ngược ra danh sách các Tạp chí duy nhất. Gọi vào bảng `Journal_Ranking` để lấy thứ hạng Tứ phân vị (cột `value_txt` của hệ đo lường `SJR_BEST_QUARTILE` có giá trị Q1, Q2, Q3, Q4) của các tạp chí này trong những năm được chọn.
- **Tính toán:** Nhóm theo Tứ phân vị, sau đó đếm tổng số tạp chí duy nhất nằm trong từng nhóm Q1, Q2, Q3, Q4. 
- **Trên Frontend:** Biểu đồ Donut tính toán tỷ trọng phần trăm theo công thức: 
  `% = Math.round((Số lượng tạp chí Qx / Tổng số tạp chí) * 100)`.

> **Tóm lại:** Biểu đồ này giống như một chiếc "bản đồ phân tầng đẳng cấp". Nhìn vào tỷ lệ phần trăm, người dùng biết ngay sân chơi học thuật của lĩnh vực/dự án đó đang nằm ở đẳng cấp nào.

---



## 2. Bảng Xếp hạng Tạp chí Hàng đầu (Top Journal Ranking)

Mục đích chính của Bảng xếp hạng là cung cấp một danh sách sàng lọc khắt khe những "trụ cột" học thuật của ngành, đi kèm với các chỉ số đo lường sức ảnh hưởng (Impact Factor, SJR) và đà tăng trưởng qua các năm.

Hệ thống đánh giá các tạp chí này thông qua các chỉ số cốt lõi:
* **Impact Factor / SJR:** Thể hiện uy tín và số lượng trích dẫn trung bình của tạp chí.
* **Trend (Đà tăng trưởng):** Xu hướng tăng hoặc giảm chỉ số ảnh hưởng trong vòng 5 năm gần nhất, giúp loại bỏ những tạp chí đang có dấu hiệu "xuống cấp".

Dựa vào danh sách này, người dùng sẽ giải quyết được các bài toán sau:

1. **Tối ưu hóa Lựa chọn Nơi xuất bản (Targeted Publishing)**
Đối với các nhà nghiên cứu đã có sẵn một bài báo chất lượng cao, bảng này đóng vai trò như một menu các tạp chí "đỉnh" nhất. Họ có thể chọn những tạp chí không chỉ thuộc Q1 mà còn có đà tăng trưởng Trend liên tục dương, đảm bảo bài báo của họ sẽ nhận được sự chú ý tối đa từ cộng đồng khoa học trong tương lai.

2. **Phân bổ Ngân sách Tài trợ Xuất bản (APC Funding Allocation)**
Đối với các Viện nghiên cứu hoặc Ban giám hiệu, việc công bố trên tạp chí mở (Open Access) thường tốn một khoản phí (APC - Article Processing Charge) rất lớn. Bảng xếp hạng này giúp nhà quản lý ra quyết định: Chỉ giải ngân tài trợ 100% phí đăng bài nếu tạp chí nằm trong Top 10 hoặc Top 20 của danh sách này, đảm bảo mỗi đồng vốn đầu tư đều sinh lời bằng danh tiếng cao nhất.

3. **Theo dõi "Sức mạnh" của các Nhà xuất bản (Publisher Tracking)**
Giúp người dùng nhìn nhận cục diện chung, xem nhà xuất bản nào (Elsevier, Springer, IEEE,...) đang thống trị lĩnh vực, từ đó có thể cân nhắc các gói đặt mua tạp chí (subscription) phù hợp cho thư viện của trường.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Backend tính toán 2 thông số chính cho mỗi Tạp chí:
  - `impactFactor` (SJR): Lấy từ bảng `Journal_Ranking` với mã `SJR` (SJR Index) của năm mới nhất.
  - `article_count`: Đếm tổng số bài báo thuộc phạm vi dự án đã được đăng trên tạp chí này.
- **Sắp xếp (Sorting):** CSDL tự động `ORDER BY` các tạp chí giảm dần theo `impactFactor` (mức độ ảnh hưởng), nếu bằng nhau sẽ xét đến `article_count` (số lượng xuất bản).
- **Trên Frontend:** Biểu đồ Bar Chart hiển thị Top 5 tạp chí đứng đầu. Thanh biểu đồ hiển thị mức độ tác động tổng hợp (*Weighted Impact Factor*).

> **Tóm lại:** Đây là một "bảng phong thần" học thuật. Giữa hàng chục ngàn tạp chí tạp nham, bảng này giúp người dùng nhìn thẳng vào những "kênh truyền thông" đắt giá nhất để gửi gắm công trình tâm huyết của mình.

---



## 3. Ma trận Tác động (Impact Matrix)

Mục đích của Ma trận Tác động là đánh giá tổng hợp chất lượng của các tạp chí thông qua biểu đồ phân tán 2 chiều (Scatter Plot). Thay vì chỉ nhìn vào một chỉ số đơn lẻ, biểu đồ này kết hợp cả sức ảnh hưởng (SJR) và năng suất/lượng trích dẫn tích lũy (H-Index) của tạp chí.

Hai trục cốt lõi của biểu đồ này là:
* **Trục X (Điểm SJR):** Đo lường mức độ uy tín và chất lượng của các trích dẫn mà tạp chí nhận được.
* **Trục Y (Chỉ số H-Index):** Đo lường năng suất công bố và số lượng bài báo có tác động lớn.

Biểu đồ kết hợp với Tứ phân vị (kích thước hoặc màu sắc hiển thị theo Q1, Q2, Q3) giúp phân loại các tạp chí thành các nhóm:
* **Góc trên bên phải (SJR cao, H-Index cao):** Đây là các tạp chí siêu ưu tú (Elite Journals), thường thuộc nhóm Q1, có danh tiếng cực kỳ vững chắc và là "tượng đài" trong ngành.
* **Góc dưới bên phải (SJR cao, H-Index thấp):** Các tạp chí có uy tín trích dẫn rất chất lượng nhưng quy mô hoặc số lượng bài báo tạo được tiếng vang lớn chưa nhiều (thường là tạp chí mới nổi hoặc kén bài).
* **Góc trên bên trái (SJR thấp, H-Index cao):** Các tạp chí phổ thông, đăng tải rất nhiều bài báo nên có lượng trích dẫn tích lũy (H-Index) cao, nhưng độ uy tín của các trích dẫn đó không cao (thường là Q2, Q3).

Giải quyết 2 bài toán lớn:

1. **Lựa chọn tạp chí tối ưu (Optimal Target Selection)**
Giúp nhà nghiên cứu chọn được tạp chí hài hòa giữa độ khó (SJR) và độ phủ sóng (H-Index). Thay vì chỉ cắm đầu vào Q1, tác giả có thể tìm những tạp chí Q2 nhưng có H-Index tiệm cận Q1 để gia tăng cơ hội được đăng bài mà vẫn đảm bảo danh tiếng.

2. **Đánh giá toàn diện, tránh số liệu ảo (Holistic Evaluation)**
Nhà quản lý có thể tránh việc bị "đánh lừa" bởi một tạp chí có H-Index cao (do đăng quá nhiều bài báo trung bình), bằng cách đối chiếu ngay lập tức với điểm SJR của nó trên cùng một mặt phẳng.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Hệ thống trích xuất đồng thời 2 chỉ số độc lập cho từng Tạp chí trong năm được chọn:
  - Chỉ số **SJR** (làm Trục X).
  - Chỉ số **H-Index** (làm Trục Y).
  Chỉ những tạp chí có tồn tại số liệu của cả 2 chỉ số này (lớn hơn 0) mới được đẩy vào ma trận.
- **Trên Frontend:** Vẽ biểu đồ phân tán (Scatter Plot). Mỗi dấu chấm đại diện cho 1 tạp chí. Tọa độ của nó là `(SJR, H-Index)`. Frontend sẽ tự tô màu và gộp nhóm các dấu chấm này dựa trên Tứ phân vị (Q1 màu đậm, Q2, Q3 màu nhạt dần) để người dùng dễ nhìn thấy sự hội tụ chất lượng.

> **Tóm lại:** Ma trận này là "kính hiển vi" soi chiếu chất lượng tạp chí. Nhìn vào biểu đồ, người dùng đánh giá được ngay sự cân bằng giữa danh tiếng học thuật (SJR) và khả năng tạo tiếng vang (H-Index) của bất kỳ Tạp chí nào trên toàn cầu.

---



## 4. Phân tích Dịch chuyển Truy cập Mở (Open Access Migration Analysis)

Mục đích chính của biểu đồ này là mô hình hóa "dòng chảy" chuyển đổi mô hình kinh doanh của các Tạp chí khoa học thông qua biểu đồ luồng (Sankey Diagram). Cụ thể, nó theo dõi sự dịch chuyển từ mô hình "Đăng ký mua" (Subscription - trả phí để đọc) sang "Truy cập mở" (Open Access - miễn phí cho độc giả).

Cấu trúc của biểu đồ:
* **Nguồn (Source):** Bắt đầu từ khối "Đăng ký mua" (mô hình truyền thống giả định).
* **Đích (Target):** Chia thành 2 nhánh: "Mô hình Truyền thống" (vẫn tiếp tục thu phí) và "Truy cập mở hoàn toàn".
* **Tỷ lệ chuyển đổi:** Thể hiện phần trăm số lượng tạp chí đã "lột xác" thành công sang mô hình Open Access.

Giải quyết 2 bài toán lớn:

1. **Hoạch định Ngân sách Xuất bản (Budget Planning for Publications)**
Các Viện nghiên cứu và Trường đại học sử dụng biểu đồ này để đánh giá xu hướng của ngành. Nếu Tỷ lệ chuyển đổi sang Open Access đang tăng mạnh, họ cần chuẩn bị sẵn một quỹ ngân sách lớn hơn (dành cho phí APC - Article Processing Charges) để hỗ trợ các nhà nghiên cứu trả phí xuất bản thay vì trả phí mua tạp chí cho thư viện như trước đây.

2. **Dự báo Độ Phủ sóng của Nghiên cứu (Visibility Forecasting)**
Các nhà nghiên cứu theo dõi dòng chảy này để hiểu rõ quy luật: "Khoa học mở đang là xu thế tất yếu". Lựa chọn một tạp chí đang hoặc đã chuyển đổi sang Open Access sẽ giúp bài báo của họ tiếp cận được nhiều độc giả hơn, từ đó gia tăng cơ hội được trích dẫn (citation) rất nhiều so với việc bị khóa sau bức tường thu phí (paywall).

---

> **Tóm lại:** Biểu đồ này là "bức tranh tài chính và phát hành" của giới học thuật, cho thấy tri thức đang dần được "mở khóa" và phân phối tự do như thế nào trên toàn cầu.

---



## 5. Danh sách Tác giả có Tầm ảnh hưởng Hàng đầu (Top Influential Authors)

Mục đích chính của danh sách này là xác định các "cây đa cây đề" hoặc những nhà khoa học đang dẫn dắt xu hướng trong một lĩnh vực cụ thể, dựa trên điểm số ảnh hưởng tổng hợp (ví dụ: số trích dẫn, H-index, năng suất xuất bản).

Dựa vào danh sách này, người dùng giải quyết được các bài toán sau:

1. **Tìm kiếm Chuyên gia (Expert Sourcing)**
Giúp tổ chức, các quỹ tài trợ hoặc ban biên tập tạp chí tìm kiếm những ứng viên lý tưởng nhất để mời làm phản biện (reviewer), tham gia hội đồng thẩm định, hoặc mời diễn giả (keynote speaker) cho các hội thảo quốc tế.

2. **Xây dựng Mạng lưới (Networking & Mentorship)**
Đối với các nhà nghiên cứu trẻ (PhD/Postdoc), đây là danh bạ để tìm kiếm các vị giáo sư đầu ngành. Nhìn vào danh sách này, họ biết nên "follow" ai, đọc bài của ai để cập nhật kiến thức, hoặc gửi email xin tham gia Lab nghiên cứu.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Tính toán điểm ảnh hưởng (Impact Score) cho từng Tác giả dựa trên 3 thông số:
  - `article_count`: Số lượng bài báo nằm trong phạm vi tìm kiếm.
  - `citation_count`: Tổng số trích dẫn từ các bài báo đó.
  - `h_index`: Chỉ số H-index của tác giả.
- **Công thức điểm thô (Raw Score):** `Raw_Score = (article_count * 0.3) + (citation_count * 0.5) + (h_index * 0.2)`
- **Chuẩn hóa (Normalization):** Điểm được chuẩn hóa về thang 0-100 (Min-Max Normalization). Tác giả dẫn đầu sẽ đạt điểm tuyệt đối là 100.0 Điểm Ảnh hưởng.
- **Trên Frontend:** Hiển thị danh sách các tác giả xếp hạng giảm dần theo điểm đã chuẩn hóa.

> **Tóm lại:** Đây là "bảng vàng" vinh danh cá nhân, giúp định vị chính xác những bộ óc xuất chúng nhất đang định hình tương lai của ngành khoa học đó.

---



## 6. Tổ chức Nghiên cứu Hàng đầu (Top Research Organizations)

Tương tự như danh sách tác giả, bảng xếp hạng này đánh giá sức mạnh tổng thể của các tổ chức (trường đại học, viện nghiên cứu, trung tâm R&D doanh nghiệp) thông qua năng suất và chất lượng công bố khoa học của toàn thể nhân sự.

Giải quyết các bài toán:

1. **Tìm kiếm Đối tác Chiến lược (Strategic Partnership)**
Giúp ban giám hiệu hoặc giám đốc Viện nghiên cứu khoanh vùng các đơn vị có thế mạnh tương đồng hoặc bổ trợ để ký kết MOU hợp tác, xin tài trợ quốc tế, hoặc đồng tổ chức các chương trình trao đổi học giả.

2. **Định hướng Môi trường Làm việc/Học tập (Institution Selection)**
Giúp sinh viên và nghiên cứu sinh đánh giá đúng thực lực của các trường đại học thay vì chỉ nhìn vào danh tiếng chung chung, từ đó chọn được bến đỗ tốt nhất để phát triển sự nghiệp học thuật.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Tính điểm hiệu suất nghiên cứu cho từng Tổ chức dựa trên lượng xuất bản và trích dẫn.
- **Công thức điểm thô (Raw Score):** Dựa trên 2 thông số trọng số chính: 
  `Raw_Score = (article_count * 0.4) + (citation_count * 0.6)`
- **Chuẩn hóa:** Tương tự thuật toán tính điểm tác giả, điểm được chuẩn hóa về thang điểm 0-100 (Điểm Trích dẫn) và hiển thị trên giao diện xếp hạng giảm dần.

> **Tóm lại:** Bảng xếp hạng này đóng vai trò như một chiếc "la bàn hợp tác", chỉ ra những bến cảng tri thức vững chãi nhất trên toàn cầu.

---



## 7. Ma trận So sánh Hiệu suất & Tầm ảnh hưởng của Tác giả (Author Performance & Influence Matrix)

Đây là một dạng biểu đồ phân tán (Scatter Chart) đánh giá độ hiệu quả của từng cá nhân dựa trên 2 tiêu chí song song:
* **Trục X (Hiệu suất):** Số lượng bài báo công bố (Năng suất làm việc).
* **Trục Y (Tầm ảnh hưởng):** Điểm H-Index, số lượng trích dẫn (Chất lượng/Độ sâu của nghiên cứu).

Biểu đồ sẽ phân loại các tác giả thành các nhóm đặc thù:
* **Chuyên gia đầu ngành (High Perf, High Influence):** Đăng bài liên tục và bài nào cũng chất lượng.
* **Học giả tinh hoa (Low Perf, High Influence):** Có thể vài năm mới ra một bài, nhưng bài nào cũng gây chấn động và được trích dẫn cực cao.
* **Nhóm "Ong thợ" (High Perf, Low Influence):** Xuất bản rất nhiều bài báo mang tính phong trào hoặc nghiên cứu nhỏ lẻ, nhưng ít mang lại đột phá.

Giải quyết bài toán:

1. **Đánh giá Nhân sự & KPI Học thuật (HR Evaluation)**
Giúp Ban quản lý khoa học của một trường đại học đánh giá thực chất năng lực của giảng viên, tránh việc chỉ đếm số lượng bài báo (đánh đồng "Ong thợ" với "Chuyên gia đầu ngành"). 

2. **Chiêu mộ Nhân tài (Headhunting)**
Giúp các tổ chức săn lùng những "Học giả tinh hoa" – những người có thể đang ẩn mình, ít công bố nhưng sở hữu những bằng sáng chế hoặc bài báo nền tảng cực kỳ đắt giá.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Trích xuất 2 tọa độ trực quan cho mỗi tác giả:
  - Trục Y (Tầm ảnh hưởng / Impact): Lấy trực tiếp chỉ số **H-Index** (`hIndex`) của tác giả.
  - Trục X (Hiệu suất / Productivity): Được định nghĩa là Sản lượng trung bình năm (`yearlyOutput`). 
    - *TH1 (Có chọn khoảng năm):* Công thức là `Tổng số bài báo / Số năm được chọn`.
    - *TH2 (Không chọn năm):* Hệ thống tự động tìm năm gần nhất mà tác giả có xuất bản bài báo và lấy số lượng xuất bản của riêng năm đó.
- **Trên Frontend:** Vẽ biểu đồ Scatter Plot. Các tác giả nằm ở góc trên bên phải là những người lý tưởng nhất: Vừa viết nhiều (Năng suất cao) vừa có chỉ số H-index lớn (Ảnh hưởng sâu rộng).

> **Tóm lại:** Biểu đồ này như một chiếc "kính lúp soi chiếu nhân tài", bóc tách rõ ràng giữa "số lượng" và "chất lượng", giúp nhà quản lý đãi cát tìm vàng.

---



## 8. Nhận định Khoa học Cốt lõi (Core Scientific Insights)

Phần này cung cấp các chỉ số đo lường vĩ mô (Quick Stats) về bản chất của mạng lưới khoa học, ví dụ: 
* Tốc độ tăng trưởng các nghiên cứu chung (Joint Ventures).
* Tỷ lệ nghiên cứu mang tính liên ngành (Inter-disciplinary Cross-over).
* Tỷ lệ bài báo thuộc nhóm Truy cập Mở (Open Access Rate).

Giải quyết bài toán:

1. **Báo cáo Nhanh (Executive Summary)**
Cung cấp cho các cấp lãnh đạo cao nhất (Bộ Khoa học Công nghệ, Giám đốc Quỹ tài trợ) một cái nhìn chớp nhoáng (snapshot) về sức khỏe và xu hướng của mạng lưới hợp tác mà không cần phải đi sâu vào đọc hiểu từng biểu đồ phức tạp.

---


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Đưa ra các con số tổng quát (Aggregated Metrics) đại diện cho sức khỏe của hệ sinh thái nghiên cứu.
  - **Số lượng liên kết (Collabs):** Đếm số lượng cặp tổ chức nghiên cứu có hợp tác cùng nhau trên ít nhất 1 bài báo (`collabCount`). 
  - **AVG GROWTH IN JOINT VENTURES:** Đo lường sự gia tăng của các bài báo hợp tác (do từ 2 tổ chức trở lên đồng tác giả). 
    > `Công thức = Số bài báo hợp tác năm nay / Số bài báo hợp tác năm liền trước` (Kết quả hiển thị dạng hệ số nhân, ví dụ: 1.5x).
  - **INTER-DISCIPLINARY CROSS-OVER:** Đo lường tỷ lệ nghiên cứu mang tính liên ngành. 
    > `Công thức = (Số bài báo có chứa Sub_Topic / Tổng số bài báo) * 100%`.
  - **OPEN ACCESS RATE:** Tỷ lệ truy cập mở của toàn bộ bài báo trong dự án. 
    > `Công thức = (Số bài báo đăng trên tạp chí Open Access / Tổng số bài báo) * 100%`.

---

> **Tóm lại:** Đây là "bảng đồng hồ đo chỉ số sinh tồn" (vitals dashboard) của lĩnh vực nghiên cứu, giúp các sếp lớn nắm bắt tình hình chỉ trong vòng 3 giây.

---



## 9. Mạng lưới Hợp tác Toàn cầu (Global Collaboration Network)

Mục đích của biểu đồ mạng lưới (Force-directed Graph) là lập bản đồ các mối quan hệ hợp tác học thuật giữa các cá nhân (tác giả) và các tổ chức (viện/trường đại học) trên phạm vi toàn cầu.

Cấu trúc biểu đồ:
* **Node (Điểm/Nút):** Đại diện cho một Tác giả hoặc một Tổ chức.
* **Edge (Đường nối):** Thể hiện sự hợp tác (ví dụ: cùng đứng tên chung trong một bài báo nghiên cứu).

Giải quyết các bài toán:

1. **Phát hiện các "Trạm trung chuyển" (Networking Hubs)**
Xác định những nhân vật trung tâm hoặc các tổ chức đang đóng vai trò kết nối chính trong ngành. Nếu một node có hàng chục đường nối tỏa ra xung quanh, đó chính là một "Keystone" (nhân tố then chốt). Bắt tay được với nhân tố này đồng nghĩa với việc bước chân được vào toàn bộ mạng lưới của họ.

2. **Phân tích Cụm và Liên minh (Cluster Analysis)**
Giúp nhận diện các "bè phái" hoặc các liên minh học thuật (ví dụ: nhóm các nhà khoa học châu Á thường xuyên hợp tác, hoặc khối các trường Ivy League chỉ làm việc nội bộ). Điều này giúp các nhà quản lý thấy rõ xu hướng toàn cầu hóa hay địa phương hóa của lĩnh vực.

3. **Mở rộng Quan hệ (Strategic Expansion)**
Giúp các nhà nghiên cứu tìm kiếm những người "bạn của bạn" (từ các node lân cận) để dễ dàng mở rộng mạng lưới hợp tác, từ đó tăng cơ hội xin tài trợ (grant) quốc tế và nâng cao khả năng xuất bản chéo.

> **Tóm lại:** Biểu đồ này giống như một "tấm bản đồ giao thương học thuật", cho thấy rõ ai đang nắm giữ quyền lực kết nối và luồng chất xám đang luân chuyển giữa các quốc gia/tổ chức như thế nào.

---



## 10. Ma trận Cường độ Chủ đề (Topic Intensity Matrix)

Mục đích của Ma trận Cường độ (Heatmap) là trực quan hóa độ tập trung và mức độ đóng góp của từng Tác giả (hoặc Tổ chức) đối với các chủ đề nghiên cứu (Topics) cụ thể. 

Cấu trúc biểu đồ:
* **Trục ngang (X):** Các chủ đề nghiên cứu (vd: Ammonia Synthesis, Advanced Photocatalysis...).
* **Trục dọc (Y):** Danh sách các Tác giả hoặc Tổ chức.
* **Màu sắc (Color Intensity):** Màu cam/đỏ càng đậm thể hiện mức độ tham gia, năng suất hoặc tầm ảnh hưởng của đối tượng đó trong chủ đề tương ứng càng cao. Màu nhạt/xám nghĩa là ít hoặc không có hoạt động.

Giải quyết các bài toán:

1. **Hồ sơ Năng lực Chuyên sâu (Detailed Profiling)**
Trả lời ngay lập tức câu hỏi "Giáo sư X mạnh nhất ở mảng nào?" hoặc "Trường đại học Y đang tập trung mũi nhọn vào đâu?". Tránh việc chỉ nhìn vào tổng số bài báo chung chung mà không biết chuyên môn thực sự của họ nằm ở ngách nào.

2. **Lắp ghép Đội hình Liên ngành (Team Assembly)**
Khi cần thành lập một nhóm nghiên cứu liên ngành hoặc một dự án lớn, Ban giám đốc có thể nhìn vào ma trận này để chọn ra người có màu đậm nhất ở Topic A kết hợp với người có màu đậm nhất ở Topic B, tạo ra một đội hình "Dream Team" hoàn hảo.

3. **Phân tích Khoảng trống (Gap Analysis)**
Giúp tổ chức/doanh nghiệp nhận ra những mảng chủ đề quan trọng đang bị "trắng" (màu nhạt) trong chính nội bộ của mình, từ đó có kế hoạch tuyển dụng bổ sung chuyên gia hoặc phân bổ ngân sách để khỏa lấp điểm yếu đó.

> **Tóm lại:** Ma trận này là "bản chụp MRI năng lực", giúp người quản lý nhìn thấu cấu trúc chuyên môn của từng cá nhân/tổ chức thay vì chỉ nhìn vào lớp vỏ bọc tổng thành tích.

---



## 11. Cụm Chủ đề Cốt lõi (Core Topic Cluster)

Mục đích của phần này là trích xuất và hiển thị nhanh số lượng các cụm từ khóa (Topics) đang đóng vai trò làm xương sống cho toàn bộ lĩnh vực nghiên cứu hiện tại.

Giải quyết bài toán:
1. **Nhận diện Trọng tâm (Focus Identification):** Giúp nhà nghiên cứu mới bước chân vào ngành hoặc các sinh viên nắm được ngay đâu là những "từ khóa bắt buộc phải biết" (ví dụ: Operating system). Nếu bỏ qua các cụm cốt lõi này, việc nghiên cứu sâu hơn sẽ mất đi nền tảng cơ bản.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Backend tính toán khối lượng bài báo (`volume`) của từng từ khóa trong 2 giai đoạn: Giai đoạn hiện tại (vd: 12 tháng qua) và Giai đoạn trước đó (vd: 12 tháng trước đó). 
- **Công thức Tăng trưởng (Growth YoY):** 
  `Growth = ((Khối lượng hiện tại - Khối lượng trước đó) / Khối lượng trước đó) * 100`
- **Trên Frontend:** 
  - **Cụm chủ đề cốt lõi (Core Clusters):** Bóc tách Từ khóa đứng Top 1 (tăng trưởng cao nhất). Hiển thị khối lượng, tên từ khóa, và một thanh tiến trình (Progress Bar) phần trăm so với mốc tối đa.
  - **Véc-tơ Xu hướng Từ khóa (Trend Vectors):** Lấy danh sách Top 10 từ khóa mạnh nhất, vẽ biểu đồ cột (Bar Chart) thể hiện động lượng (momentum) tăng trưởng của chúng.

> **Tóm lại:** Đây là "kim chỉ nam" giúp người dùng không bị lạc lối giữa rừng từ khóa, luôn bám sát vào trục kiến thức chính của ngành.

---



## 12. Véc-tơ Xu hướng Từ khóa (Keyword Trend Vector)

Biểu đồ cột xếp chồng (Stacked Bar Chart) này theo dõi tốc độ gia tăng (momentum) và sự chú ý dành cho các chủ đề tiên phong theo chu kỳ thời gian (hàng ngày hoặc hàng tháng) xuyên suốt 12 tháng qua.

Giải quyết bài toán:
1. **Phát hiện Xu hướng Đột biến (Breakout Detection):** Giúp quan sát các điểm bùng phát (tiếng vang). Ví dụ: Sự kiện ra mắt ChatGPT có thể làm cột dữ liệu của từ khóa "LLM" tăng vọt trong tháng đó.
2. **Ra Quyết định Đầu tư sớm:** Giúp PM hoặc các nhà phân tích dự báo (forecaster) nhận diện sớm một công nghệ đang vào form "bùng nổ" để rót vốn R&D trước khi đối thủ nhận ra.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Backend tính toán khối lượng bài báo (`volume`) của từng từ khóa trong 2 giai đoạn: Giai đoạn hiện tại (vd: 12 tháng qua) và Giai đoạn trước đó (vd: 12 tháng trước đó). 
- **Công thức Tăng trưởng (Growth YoY):** 
  `Growth = ((Khối lượng hiện tại - Khối lượng trước đó) / Khối lượng trước đó) * 100`
- **Trên Frontend:** 
  - **Cụm chủ đề cốt lõi (Core Clusters):** Bóc tách Từ khóa đứng Top 1 (tăng trưởng cao nhất). Hiển thị khối lượng, tên từ khóa, và một thanh tiến trình (Progress Bar) phần trăm so với mốc tối đa.
  - **Véc-tơ Xu hướng Từ khóa (Trend Vectors):** Lấy danh sách Top 10 từ khóa mạnh nhất, vẽ biểu đồ cột (Bar Chart) thể hiện động lượng (momentum) tăng trưởng của chúng.

> **Tóm lại:** Biểu đồ này như một "công tơ mét tốc độ", đo lường độ nóng của các từ khóa để biết xu hướng nào đang chạy nước rút và xu hướng nào đang đuối sức.

---



## 13. Biểu đồ Dây Hợp tác Quốc gia (National Collaboration Chord Chart)

Đây là dạng biểu đồ dây (Chord Diagram) cực kỳ trực quan nhằm lập bản đồ các luồng hợp tác học thuật và trao đổi tri thức xuyên biên giới (ví dụ: China, US, Canada, Sweden...). Các vòng cung đại diện cho quốc gia, còn độ dày của các dây nối thể hiện số lượng bài báo hợp tác chung.

Giải quyết bài toán:
1. **Hoạch định Ngoại giao Khoa học (Science Diplomacy):** Giúp Bộ Khoa học hoặc Ban giám hiệu các đại học lớn đánh giá bức tranh tổng thể: "Nước mình đang chơi thân với ai nhất?".
2. **Cân bằng Chiến lược Hợp tác:** Trực quan hóa việc một quốc gia có đang quá phụ thuộc vào một đối tác duy nhất hay không, từ đó đưa ra chiến lược đa dạng hóa quan hệ học thuật sang các khu vực mới.

---


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Lọc tất cả bài báo, dò tìm Tổ chức (Institution) của các Tác giả để lấy ra Quốc gia (Country). Nếu một bài báo có tác giả từ 2 quốc gia trở lên (vd: Việt Nam, Mỹ, Nhật), hệ thống tách ra thành các cặp hợp tác: (Việt Nam - Mỹ), (Việt Nam - Nhật), (Mỹ - Nhật).
- **Tính toán:** Đếm số lần xuất hiện (`coAuthorshipValue`) của từng cặp. Thuật toán sẽ tính tổng "Sức mạnh hợp tác" của từng quốc gia, và chỉ giữ lại Top N Quốc gia hàng đầu, đồng thời loại bỏ các cặp có tần suất quá nhỏ (`minValue`). Tăng trưởng YoY của từng cặp cũng được tính bằng cách so sánh với số liệu chu kỳ trước.
- **Trên Frontend:** Vẽ biểu đồ Chord (Dây cung) kết nối các quốc gia. Bên cạnh là danh sách các "Liên kết hợp tác chính" được sắp xếp giảm dần, kèm % tăng trưởng.

> **Tóm lại:** Đây là "bản đồ địa chính trị" của giới học thuật, phơi bày rõ mọi sợi dây liên kết và sự chuyển giao chất xám giữa các siêu cường.

---



## 14. Danh sách Liên kết Hợp tác Chính (Main Collaboration Links)

Danh sách này bóc tách chi tiết dữ liệu từ biểu đồ dây, liệt kê top các cặp quốc gia hợp tác mạnh nhất (vd: China ↔ US) đi kèm với chỉ số phần trăm tỷ trọng và mức độ tăng trưởng (YoY Growth).

Giải quyết bài toán:
1. **Theo dõi Động thái Địa chính trị:** Giúp nhà quản lý thấy được sự thay đổi tinh tế. Ví dụ, nếu hợp tác China ↔ US giảm mạnh (-33%) nhưng China ↔ Sweden lại tăng vọt (+100%), điều này phản ánh trực tiếp bối cảnh căng thẳng chính trị đã lan sang giới hàn lâm.
2. **Lựa chọn Quốc gia Du học/Công tác:** Nghiên cứu sinh có thể chọn các quốc gia đang có đà tăng trưởng hợp tác mạnh mẽ với nước sở tại để dễ dàng tìm kiếm học bổng và visa.

> **Tóm lại:** Danh sách này là "báo cáo tài chính" của các mối quan hệ, đo lường chính xác lời/lỗ trong việc hợp tác giữa các quốc gia qua từng năm.

---



## 15. Phân tích Liên kết Hợp tác & Nút Quan trọng (Collaboration Link Analysis)

Hệ thống tự động đọc hiểu dữ liệu và tổng hợp thành các đoạn văn bản nhận định (Insights), đồng thời chỉ đích danh các "Liên kết mới nổi" (Emerging Links) và "Nút quan trọng" (Crucial Nodes). Kèm theo đó là tính năng "Xuất Ma trận Thô".

Giải quyết bài toán:
1. **Đọc vị Mạng lưới Tự động (Automated Insights):** Thay vì người dùng phải tự dò dẫm phân tích trên các biểu đồ phức tạp, hệ thống đã "mớm" sẵn kết luận quan trọng nhất.
2. **Báo cáo Chuyên sâu (Reporting):** Chức năng xuất ma trận thô giúp các chuyên gia phân tích dữ liệu (Data Analyst) tải ngay file số liệu để đưa vào các phần mềm chuyên nghiệp (như Gephi, VOSviewer) hoặc dùng cho các cuộc họp cấp cao (Executive Meeting).


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Backend tổng hợp insight dạng text (chữ) dựa trên dữ liệu mạng lưới:
  - Dò tìm cặp quốc gia có mức tăng trưởng hợp tác cao nhất để sinh ra câu nhận định: *"Global research output has shifted significantly..."*
  - **Liên kết mới nổi (Emerging Link):** Lấy từ khóa tăng trưởng mạnh nhất (Top 1) và ghép với một khối định danh (ví dụ: BRICS + Khái niệm).
  - **Nút quan trọng (Critical Node):** Lấy từ khóa nổi bật thứ 2 làm nút thắt quan trọng trong mạng lưới.

> **Tóm lại:** Đây là người "trợ lý phân tích", tóm gọn toàn bộ ý nghĩa phức tạp của mạng lưới thành những câu chữ đơn giản, có tính ứng dụng cao nhất.

---



## 16. Độ gần gũi Khái niệm (Concept Proximity)

Biểu đồ mạng lưới (Network Graph) thu nhỏ này trực quan hóa cấu trúc cốt lõi của các cụm từ khóa (Clusters). Nó hiển thị các nút (Nodes) đại diện cho các khái niệm và các cạnh (Edges) đại diện cho mối liên hệ giữa chúng, kèm theo chỉ số "Mật độ Nút" (Node Density).

Giải quyết bài toán:
1. **Đánh giá Tính liên kết của Ngành:** Mật độ nút (ví dụ: 0.13) cho biết các khái niệm trong lĩnh vực này có sự liên kết chặt chẽ hay rời rạc. Mật độ cao chứng tỏ đây là một lĩnh vực đã trưởng thành, các kiến thức đan xen sâu sắc.
2. **Khám phá Cấu trúc Kiến thức:** Giúp người dùng hình dung nhanh hình thái của các cụm chủ đề, xem chúng xoay quanh một lõi trung tâm hay phân tán thành nhiều hòn đảo độc lập.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Trích xuất Mạng lưới Khái niệm (Conceptual Network). Các "Nút" (Nodes) là Từ khóa. Nếu 2 từ khóa cùng xuất hiện trong 1 bài báo, chúng sẽ được nối với nhau bằng một "Cạnh" (Edge - `CONCEPTUAL_PROXIMITY`).
- **Trên Frontend:** Vẽ đồ thị mạng (Network Graph). Các từ khóa thường xuyên đi chung với nhau sẽ bị lực hút kéo lại gần thành các cụm (Clusters). Kích thước của Nút phản ánh tổng số lượng bài báo chứa từ khóa đó.

> **Tóm lại:** Đây là "chụp X-quang" cấu trúc bộ não của lĩnh vực nghiên cứu, cho thấy các nơ-ron kiến thức kết nối với nhau như thế nào.

---



## 17. Liên kết chéo Lĩnh vực (Cross-domain Linkages)

Card thống kê này đo lường "Tỷ lệ Chuyển giao" (Transfer Rate), thể hiện phần trăm số lượng bài báo hoặc công trình nghiên cứu có sự giao thoa, vay mượn phương pháp giữa nhiều chuyên ngành khác nhau (Multi-disciplinary).

Giải quyết bài toán:
1. **Đo lường Tính Liên ngành:** Một tỷ lệ chuyển giao cao (ví dụ: 74%) chứng minh lĩnh vực này đang vay mượn rất nhiều kiến thức từ các ngành khác (như Sinh học kết hợp với AI). Tỷ lệ thấp (0%) cho thấy ngành đang phát triển cục bộ, thiếu tính đột phá từ bên ngoài.
2. **Theo dõi Động lực Đổi mới:** Giúp các nhà phân tích chiến lược nhận biết liệu lĩnh vực có đang hấp thụ phương pháp luận từ các miền kiến thức mới để phá vỡ các rào cản truyền thống hay không.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Nhằm đánh giá mức độ nghiên cứu liên ngành. Hệ thống lọc bài báo, sau đó đếm xem mỗi bài báo thuộc bao nhiêu Chuyên ngành (Subject Category) khác nhau.
- **Công thức tính Tỷ lệ liên kết:** 
  Đếm số bài báo thuộc từ 2 chuyên ngành trở lên (`crossArticles`). 
  `Tỷ lệ (%) = Math.round((crossArticles / Tổng số bài báo) * 100)`
- **Trên Frontend:** Hiển thị con số % (Ví dụ: 74% bài báo có tính chất liên ngành).

> **Tóm lại:** Đây là thước đo "độ mở" của lĩnh vực. Một lĩnh vực càng có nhiều liên kết chéo, tiềm năng sinh ra các phát minh đột phá càng lớn.

---



## 18. Dịch chuyển Cụm theo Thời gian (Cluster Shift over Time)

Biểu đồ Bản đồ nhiệt (Heatmap) này theo dõi sự biến đổi cường độ của các cụm từ khóa qua từng năm (hoặc từng chu kỳ thời gian). Đi kèm là chỉ số "Entropy Dịch chuyển" (Shift Entropy) đánh giá mức độ ổn định của xu hướng.

Giải quyết bài toán:
1. **Phân tích Vòng đời Công nghệ/Khái niệm:** Màu sắc đậm nhạt trên heatmap giúp nhận diện rõ ràng một cụm chủ đề đang ở giai đoạn "khởi phát", "bùng nổ" (màu đậm nhất) hay "thoái trào" qua các năm.
2. **Dự báo Độ Ổn định (Entropy):** Chỉ số Entropy (ví dụ: LOW) cho biết xu hướng đang ổn định (các cụm lớn vẫn giữ vững vị thế) hay đang trong giai đoạn hỗn loạn (HIGH) khi các chủ đề liên tục soán ngôi nhau. Điều này rất quan trọng để các nhà đầu tư R&D quyết định có nên rót vốn vào lúc này hay không.

---


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** 
  - Backend tìm ra Top 7 Từ khóa lớn nhất trong 8 năm qua.
  - Đếm số lượng bài báo của 7 từ khóa này cho từng năm để tạo thành một ma trận/lưới 7x8 = 56 ô.
  - Khối lượng của từng ô được đối chiếu với ô cao nhất (`maxVol`) để quy đổi thành Cường độ màu (Intensity) từ `0.1` đến `1.0`.
- **Tính toán Drift Entropy:** Đo lường độ ổn định của xu hướng bằng cách tính tỷ lệ số lượng bài báo giữa 2 chuyên ngành dẫn đầu. Nếu tỷ lệ > 2, Entropy là LOW (Ổn định). Nếu < 1.2 là HIGH (Hỗn loạn).
- **Trên Frontend:** Vẽ biểu đồ Heatmap (Bản đồ nhiệt), thể hiện sự "đậm lên" hoặc "nhạt đi" của các cụm từ khóa qua từng năm, giúp nhận diện sự dịch chuyển trọng tâm nghiên cứu.

> **Tóm lại:** Biểu đồ này như một "thước phim tua nhanh", cho thấy sự thăng trầm của các đế chế kiến thức qua thời gian và dự báo mức độ nhiễu loạn của tương lai.

---



## 19. Danh mục Tạp chí Đang theo dõi (Tracked Journals)

Đây là giao diện quản lý danh sách các tạp chí mà người dùng đang theo dõi sát sao. Hệ thống liên tục cập nhật theo thời gian thực (real-time) hoặc định kỳ về chỉ số tác động (Impact Factor / SJR) và vẽ biểu đồ sparkline (Xu hướng) để quan sát quỹ đạo phát triển của tạp chí.

Giải quyết bài toán:
1. **Giám sát Sức khỏe Học thuật:** Biểu đồ "Xu hướng" giúp người dùng nhanh chóng nhận ra một tạp chí đang thăng hạng (để ưu tiên gửi bài) hay đang có dấu hiệu tụt dốc, đánh mất vị thế.
2. **Quản lý Hạn mức Theo dõi (Tracking Limit):** Với số lượng tạp chí khổng lồ, việc giới hạn (ví dụ: 150 tạp chí) giúp người dùng chắt lọc ra những kênh truyền thông chất lượng nhất, đồng thời hệ thống cung cấp "Điểm IP Trung bình" để đánh giá tổng thể chất lượng của toàn bộ danh mục đang theo dõi.

> **Tóm lại:** Đây là "danh mục đầu tư" của các nhà khoa học, giúp họ theo dõi "tỷ giá" (Impact Factor) của các tạp chí giống như việc theo dõi giá cổ phiếu trên thị trường chứng khoán.

---



## 20. Thẻ thống kê Hệ sinh thái toàn cầu (Global Ecosystem Summary Cards)

Tập hợp các thẻ chỉ số cốt lõi giúp người dùng có cái nhìn toàn cảnh ngay lập tức về quy mô và động lực của hệ sinh thái nghiên cứu. Bao gồm tổng số Tác giả (Authors), Tổ chức (Organizations), Chỉ số mật độ (Density Index), và Mức độ dịch chuyển (Shifted).

Giải quyết bài toán:
1. **Đo lường Quy mô:** Nắm bắt nhanh độ lớn của lĩnh vực thông qua số lượng nhân lực (Tác giả) và cơ sở hạ tầng (Tổ chức) tham gia.
2. **Đánh giá Động lực học:** Các chỉ số như Mật độ và Dịch chuyển cho biết lĩnh vực này đang bão hòa (ổn định) hay đang có sự xáo trộn lớn về xu hướng.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập (Công thức Thực tế vs Proxy):** 
  Do giới hạn về hiệu năng khi xử lý Big Data, Backend sử dụng các **công thức tính toán thay thế (Proxy Formulas)** thay cho công thức thực tế tốn kém:
  
  - **1. Chỉ số mật độ (Density Index):** 
    - *Công thức thực tế (Lý thuyết Đồ thị - Network Density):* $D = \frac{2E}{N(N - 1)}$ (Với $N$ là tổng tác giả, $E$ là tổng số liên kết đồng tác giả). Yêu cầu thuật toán duyệt chập 2 rất nặng nề.
    - *Công thức Proxy đang dùng:* Sử dụng tỷ lệ `Trích dẫn trung bình / Bài báo` (`Tổng Citations / Tổng Articles`). Nếu chênh lệch so với kỳ trước nằm trong khoảng hẹp (-0.5% đến +0.5%), gán trạng thái `stable` (Ổn định).
  
  - **2. Đã dịch chuyển (Shifted):** 
    - *Công thức thực tế (Tỷ lệ Dịch chuyển/Entropy):* Đo lường Tỷ lệ tác giả thay đổi Chủ đề chính (Primary Topic) giữa 2 năm, hoặc dùng công thức Shannon Entropy $H = - \sum (P_i \times \log_2(P_i))$ để tính độ phân tán.
    - *Công thức Proxy đang dùng:* Ước lượng dựa trên hằng số xác suất. Công thức: `Tổng số Tác giả (Total Authors) * 0.04634` (Giả định baseline có ~4.6% tác giả dịch chuyển chuyên môn). Tốc độ tăng/giảm cũng được ước lượng theo tốc độ tăng tác giả trừ đi một hằng số hiệu chỉnh, nếu không biến động sẽ trả về `-2.1%`.

- **Trên Frontend:** Hiển thị dưới dạng một hàng (Row) gồm 4 Card nổi bật nằm trên cùng của giao diện Hệ sinh thái toàn cầu. Các đường biểu đồ Sparkline được vẽ dựa trên trạng thái (tăng/giảm/ổn định).

> **Tóm lại:** Việc sử dụng công thức Proxy (lấy Hằng số cơ sở / Điểm trung bình) thay vì thuật toán chuẩn mực $N(N-1)$ là một kỹ thuật tối ưu hóa hiệu năng (Performance Trick) bắt buộc phải có. Nó giúp Dashboard phản hồi dưới 1 giây thay vì bắt hệ thống phải truy vấn đồ thị hàng triệu điểm dữ liệu làm treo máy chủ, trong khi đường cong xu hướng (Trend) vẫn đảm bảo bám sát thực tế.
---



## 21. Bản đồ nhiệt địa lý (Geographical Heatmap)

Biểu đồ Bản đồ thế giới (Choropleth Map) thể hiện mật độ sản lượng nghiên cứu của từng quốc gia. Các quốc gia có sản lượng công bố khoa học càng lớn thì màu cam càng đậm.

Giải quyết bài toán:
1. **Xác định Trung tâm Quyền lực Học thuật:** Nhìn vào bản đồ, người dùng ngay lập tức biết quốc gia nào đang dẫn dắt cuộc chơi (ví dụ: Mỹ, Trung Quốc, hay Châu Âu). 
2. **Quy hoạch Hợp tác Quốc tế:** Giúp các trường đại học hoặc quỹ đầu tư xác định nên mở rộng quan hệ hợp tác với khu vực nào để tận dụng nguồn chất xám đang trỗi dậy.


### ⚙️ Nguồn dữ liệu & Công thức tính
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

> **Tóm lại:** Đây là "bản đồ phân chia tầm ảnh hưởng", cho thấy cán cân quyền lực khoa học trên toàn cầu đang nghiêng về cường quốc nào.

---



## 22. Tổng quan Nghiên cứu (Research Overview Treemap)

Biểu đồ dạng Cây (Treemap) hiển thị các mảng chủ đề nghiên cứu trọng điểm dưới dạng các khối hình chữ nhật. Diện tích của mỗi khối tỷ lệ thuận với khối lượng bài báo hoặc sự quan tâm dành cho chủ đề đó (ví dụ: AMMONIA SYNTHESIS chiếm 5%).

Giải quyết bài toán:
1. **Phân bổ Ngân sách/Nguồn lực:** Giúp nhà quản lý dự án (PM) hoặc nhà đầu tư biết được dòng tiền và chất xám đang đổ dồn vào những "miếng bánh" nào lớn nhất.
2. **Nhận diện Chủ đề Thống trị:** Cung cấp cái nhìn trực quan so sánh độ lớn giữa các ngách nghiên cứu mà không cần đọc các báo cáo dài dòng.


### ⚙️ Nguồn dữ liệu & Công thức tính
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

> **Tóm lại:** Biểu đồ này như một "lát cắt thị phần", phơi bày rõ ràng ngách nghiên cứu nào đang "ăn nên làm ra" nhất.

---



## 23. Thực thể Hàng đầu (Top Entities / Institutions)

Biểu đồ thanh ngang (Horizontal Bar Chart) xếp hạng các tổ chức, viện nghiên cứu, hoặc công ty công nghệ (ví dụ: Google DeepMind, University of Hong Kong) có đóng góp lớn nhất vào lĩnh vực, tính theo điểm số sức ảnh hưởng hoặc số lượng công bố.

Giải quyết bài toán:
1. **Săn lùng Nhân tài (Talent Acquisition) & Đối tác:** Các tập đoàn công nghệ có thể dùng danh sách này để tìm kiếm các viện nghiên cứu top đầu nhằm tài trợ dự án hoặc chiêu mộ chuyên gia.
2. **Phân tích Cạnh tranh:** Các trường đại học dùng bảng xếp hạng này để biết "đối thủ" của mình là ai và họ đang mạnh cỡ nào.


### ⚙️ Nguồn dữ liệu & Công thức tính
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

> **Tóm lại:** Đây là "bảng vàng danh dự", vinh danh những tổ chức đang nắm giữ chìa khóa công nghệ và tri thức của toàn ngành.

---



## 24. Xu hướng Công bố (Publication Trends)

Biểu đồ miền (Area Chart) này theo dõi tổng sản lượng bài báo khoa học được xuất bản qua từng năm, kèm theo tỷ lệ tăng trưởng (YoY) so với giai đoạn trước.

Giải quyết bài toán:
1. **Đánh giá Sức sống của Ngành:** Một xu hướng đi lên đều đặn chứng tỏ lĩnh vực đang thu hút nhiều sự quan tâm và đầu tư. Nếu biểu đồ cắm đầu đi xuống (ví dụ: -96.3% YoY), đó là tín hiệu cảnh báo mảng nghiên cứu này đang bị bão hòa hoặc thoái trào.
2. **Quyết định Tham gia (Entry Decision):** Nhà nghiên cứu trẻ có thể tránh "nhảy" vào những lĩnh vực đang trên đà lao dốc để khỏi lãng phí thời gian và khó xin tài trợ.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Đếm tổng số bài báo xuất bản theo từng năm trong khoảng thời gian được chọn (thường là 5 năm qua).
- **Tính toán Tăng trưởng (Growth Rate YoY):** 
  Lấy số lượng bài báo của năm gần nhất (`currentVal`) và năm liền kề trước đó (`previousVal`).
  > `Tỷ lệ YoY (%) = Math.round(((currentVal - previousVal) / previousVal) * 100)`
- **Trên Frontend:** Biểu đồ miền (Area chart) vẽ đường xu hướng sản lượng qua các năm. Hiển thị % tăng trưởng ở góc phải trên cùng (như trong ảnh là -61.7% YoY).

> **Tóm lại:** Đây là "nhịp tim" của lĩnh vực, cho biết ngách nghiên cứu này đang hưng thịnh hay đang chết dần.

---



## 25. Đối chiếu Trích dẫn (Citation Comparison)

Biểu đồ đường (Line Chart) so sánh lượng trích dẫn nội bộ (tự trích dẫn lẫn nhau giữa các tác giả/nhóm) và trích dẫn bên ngoài (được các nhóm độc lập khác trích dẫn).

Giải quyết bài toán:
1. **Kiểm định Chất lượng Thực sự:** Nếu lượng trích dẫn nội bộ quá cao trong khi trích dẫn bên ngoài thấp, điều đó cho thấy lĩnh vực này đang "tự sướng", thiếu sự công nhận từ cộng đồng khoa học rộng lớn.
2. **Phát hiện Bơm thổi (Citation Cartels):** Giúp các quỹ tài trợ phát hiện các nhóm nghiên cứu cố tình trích dẫn chéo nhau để gian lận chỉ số ảnh hưởng.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Sử dụng Graph Database (Neo4j) quét các mối quan hệ trích dẫn `(Article)-[REFERENCES]->(Article)` để phân tích tính nội bộ/ngoại lai.
- **Phân loại Nội bộ / Bên ngoài:**
  - **Trích dẫn nội bộ (Self / Internal):** Xác định khi có ít nhất một tác giả nằm ở cả Bài báo đi trích dẫn và Bài báo bị trích dẫn. Code Neo4j: `EXISTS { (a)<-[:WRITES]-(:Author)-[:WRITES]->(b) }`.
  - **Trích dẫn bên ngoài (External):** Không có sự trùng lặp tác giả nào giữa 2 bài báo.
- **Trên Frontend:** Biểu đồ đường (Line chart) với 2 dải màu phân biệt, thể hiện tổng số lượng trích dẫn nội bộ và bên ngoài thay đổi thế nào theo từng năm.

> **Tóm lại:** Biểu đồ này là "máy phát hiện nói dối", bóc trần giá trị thực sự của các công trình nghiên cứu thay vì chỉ nhìn vào tổng số trích dẫn ảo.

---



## 26. Sự Tiến hóa Chủ đề (Topic Evolution)

Biểu đồ dòng chảy (Stream/Area Chart) theo dõi sự thay đổi trọng tâm nghiên cứu giữa các mảng chủ đề lớn (ví dụ: CO2 Reduction, Solar-powered Water). Nó gắn nhãn các chủ đề theo chu kỳ: Expanding (Mở rộng), Stable (Ổn định), Emerging (Mới nổi).

Giải quyết bài toán:
1. **Bắt mạch Xu hướng Cốt lõi:** Giúp người dùng thấy được chủ đề nào đang phình to ra (chiếm sóng) và chủ đề nào đang teo tóp lại qua từng năm.
2. **Định hướng Đề tài:** Một nghiên cứu sinh chuẩn bị làm luận án (PhD) có thể nhìn vào đây để chọn những chủ đề dán nhãn "Emerging" hoặc "Expanding" nhằm đảm bảo tính thời sự và dễ được đăng bài.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Sử dụng PostgreSQL để tìm ra **Top 3 Chủ đề (Topics)** nổi bật nhất dựa trên tổng số lượng bài báo xuất bản trong giai đoạn.
- **Tính toán & Phân loại:** 
  - Đếm chi tiết số bài báo của 3 chủ đề này theo từng năm để vẽ sóng biểu đồ.
  - Tính tỷ trọng phần trăm của mỗi chủ đề so với toàn bộ dự án: `(Tổng số bài của Chủ đề / Tổng số bài toàn dự án) * 100`.
  - Phân loại trạng thái chu kỳ (Emerging / Expanding / Stable) để hiển thị nhãn text bên dưới biểu đồ.
- **Trên Frontend:** Biểu đồ dạng luồng (Stream/Area chart) mô phỏng độ phình to hay thu hẹp của 3 chủ đề lớn nhất theo dòng thời gian.

> **Tóm lại:** Đây là "bản đồ tiến hóa", kể câu chuyện về sự chuyển giao quyền lực giữa các công nghệ lõi trong quá khứ và hiện tại.

---



## 27. Phát hiện Tiên phong (Frontier Detection)

Biểu đồ Scatter Plot phân loại các chủ đề thành "Tiên phong" (Frontier) hoặc "Mới nổi" (Emerging) dựa trên 2 trục: Tốc độ trích dẫn (nhanh hay chậm) và Chỉ số tác động (cao hay thấp).

Giải quyết bài toán:
1. **Đãi cát tìm vàng:** Khám phá những mảng kiến thức đột phá nhất (các chấm ở góc trên cùng bên phải). Đây là những công nghệ lõi đang dẫn dắt toàn bộ nền khoa học.
2. **Chiến lược Đầu tư R&D:** Giúp các tập đoàn công nghệ hoặc chính phủ quyết định rót vốn vào đâu để đi tắt đón đầu, chiếm lĩnh bản quyền trí tuệ trước các quốc gia khác.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Quét các chủ đề bằng Graph DB (Neo4j), đếm tổng số bài báo (`articleCount`) và tổng số lượng bị trích dẫn (`citationCount`).
- **Tính toán 2 hệ tọa độ (X, Y):**
  - **Chỉ số Tác động (Impact Factor - Trục Y):** Tính bằng `citationCount / articleCount` (Số trích dẫn trung bình/1 bài báo). Điểm này sau đó được chuẩn hóa (Scale) về thang điểm tối đa là 10.0 để vẽ lên biểu đồ.
  - **Tốc độ Trích dẫn (Citation Velocity - Trục X):** Đo lường thứ hạng phần trăm (percentile rank) lượng trích dẫn của chủ đề này so với các chủ đề khác. Điểm được quy đổi vào thang đo chuẩn từ 3.0 đến 9.5 điểm.
- **Phân loại Trạng thái Tiên phong:** 
- Nếu `Impact Factor >= 3.0` VÀ `Citation Velocity >= 5.0` -> Đánh giá là **FRONTIER** (Tiên phong / Đi đầu).
  - Các trường hợp còn lại -> Đánh giá là **EMERGING** (Mới nổi).
- **Trên Frontend:** Biểu đồ Scatter Plot định vị các chủ đề. Các chủ đề màu cam đậm (Tiên phong) sẽ hội tụ ở khu vực góc trên bên phải của không gian đồ thị (nơi có Tốc độ trích dẫn cao và Tác động lớn nhất).

> **Tóm lại:** Đây là "radar tầm xa", rà quét và khóa mục tiêu vào những mảng công nghệ "hot" nhất có khả năng thay đổi thế giới.

---



## 28. Dự báo Xu hướng Tương lai (Future Trend Forecasting)

Khu vực này được thiết kế để sử dụng các mô hình học máy (Machine Learning/AI) dự báo quỹ đạo phát triển của các chủ đề trong 3-5 năm tới.

Giải quyết bài toán:
1. **Tầm nhìn Chiến lược:** Thay vì chỉ nhìn vào dữ liệu quá khứ, biểu đồ cung cấp cho các nhà hoạch định chính sách một khung tham chiếu về tương lai.
2. **Chủ động Ứng phó:** Nhận diện sớm các xu hướng có nguy cơ thoái trào để kịp thời chuyển hướng nghiên cứu.


### ⚙️ Nguồn dữ liệu & Công thức tính
- **Logic thu thập:** Sử dụng các mô hình học máy (Machine Learning/AI) dự kiến tích hợp, hoặc các thuật toán ngoại suy tuyến tính (Linear Extrapolation) trên nền dữ liệu chuỗi thời gian (time-series) của 5-10 năm quá khứ.
- **Tính toán:** Phân tích độ dốc (slope) của sự tăng trưởng tần suất xuất hiện từ khóa, kết hợp với biến động của lượng trích dẫn để vẽ ra một đường dự báo (forecast line) kèm theo khoảng tin cậy (confidence interval) trong 3-5 năm tới.
- **Trên Frontend:** (Khu vực đang chờ dữ liệu) Sẽ hiển thị một biểu đồ đường (Line chart) với nét đứt đại diện cho dữ liệu dự báo tương lai, giúp định hình quỹ đạo của các chủ đề lõi.

---

> **Tóm lại:** Đây là "quả cầu pha lê" của giới học thuật, mang đến lợi thế tiên tri cho những ai nắm bắt được nó.
