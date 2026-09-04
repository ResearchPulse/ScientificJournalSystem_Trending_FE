/* eslint-disable no-unused-vars */
import React, { useRef } from 'react';
import { ReportGenerator as Generator } from '../../utils/ReportGenerator';

export const ReportGeneratorComponent = ({ projectName, projectId, onGenerate }) => {
  const containerRef = useRef(null);

  const handleGenerate = async (queryClient) => {
    const generator = new Generator(projectName, projectId);
    
    await generator.addCoverPage();
    
    // Add sections by finding selectors
    const charts = [
      { id: '.publication-trend-chart-wrapper', title: 'Publication Trend' },
      { id: '.top-entities-card', title: 'Top Research Entities' }
    ];

    for (const chart of charts) {
      generator.addSectionHeader(chart.title);
      await generator.addChart(chart.id);
    }

    generator.save();
  };

  return null; // This is a utility/controller component
};
