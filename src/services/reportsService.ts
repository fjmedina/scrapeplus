import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import type { WebsiteMetrics } from './websiteAnalysis';
import type { SocialAnalysis } from './socialMediaAnalysis';
import type { NewsAnalysis } from './newsAnalysis';

export interface Report {
  id: string;
  name: string;
  createdAt: string;
  format: 'detailed' | 'summary';
  dateRange: string;
  websiteAnalyses: Array<{
    url: string;
    metrics: WebsiteMetrics;
  }>;
  socialAnalyses: Array<{
    brand: string;
    data: SocialAnalysis;
  }>;
  newsAnalyses: Array<{
    query: string;
    data: NewsAnalysis;
  }>;
}

interface GenerateReportOptions {
  name: string;
  sections: {
    websites: boolean;
    social: boolean;
    news: boolean;
  };
  dateRange: string;
  format: 'detailed' | 'summary';
}

export async function generateReport(options: GenerateReportOptions, userId: string): Promise<Report> {
  try {
    const dateFrom = new Date();
    switch (options.dateRange) {
      case 'last24h':
        dateFrom.setHours(dateFrom.getHours() - 24);
        break;
      case 'last7d':
        dateFrom.setDate(dateFrom.getDate() - 7);
        break;
      case 'last30d':
        dateFrom.setDate(dateFrom.getDate() - 30);
        break;
      case 'last90d':
        dateFrom.setDate(dateFrom.getDate() - 90);
        break;
    }

    // Fetch analyses based on selected sections and date range
    const [websites, social, news] = await Promise.all([
      options.sections.websites ? supabase
        .from('website_analyses')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateFrom.toISOString())
        .order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
      options.sections.social ? supabase
        .from('social_analyses')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateFrom.toISOString())
        .order('created_at', { ascending: false }) : Promise.resolve({ data: [] }),
      options.sections.news ? supabase
        .from('news_analyses')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateFrom.toISOString())
        .order('created_at', { ascending: false }) : Promise.resolve({ data: [] })
    ]);

    const report: Report = {
      id: crypto.randomUUID(),
      name: options.name,
      createdAt: new Date().toISOString(),
      format: options.format,
      dateRange: options.dateRange,
      websiteAnalyses: websites.data?.map(wa => ({
        url: wa.url,
        metrics: wa.metrics
      })) || [],
      socialAnalyses: social.data?.map(sa => ({
        brand: sa.brand,
        data: sa.data
      })) || [],
      newsAnalyses: news.data?.map(na => ({
        query: na.query,
        data: na.data
      })) || []
    };

    // Store the report
    await supabase.from('reports').insert({
      id: report.id,
      user_id: userId,
      name: report.name,
      data: report
    });

    return report;
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
}

export async function getReports(userId: string): Promise<Report[]> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data?.map(r => r.data) || [];
}

export function downloadReportPDF(report: Report) {
  const doc = new jsPDF();
  let y = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Indigo color
  doc.text(report.name, 20, y);
  y += 15;

  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128); // Gray color
  doc.text(`Generated on: ${new Date(report.createdAt).toLocaleString()}`, 20, y);
  y += 10;
  doc.text(`Report Type: ${report.format === 'detailed' ? 'Detailed Report' : 'Executive Summary'}`, 20, y);
  y += 20;

  // Executive Summary
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text('Executive Summary', 20, y);
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(55, 65, 81);
  const summary = [
    `Total Website Analyses: ${report.websiteAnalyses.length}`,
    `Total Social Media Analyses: ${report.socialAnalyses.length}`,
    `Total News Analyses: ${report.newsAnalyses.length}`
  ];

  summary.forEach(line => {
    doc.text(line, 30, y);
    y += 7;
  });
  y += 10;

  if (report.format === 'detailed') {
    // Website Analyses
    if (report.websiteAnalyses.length > 0) {
      doc.setFontSize(16);
      doc.text('Website Analyses', 20, y);
      y += 10;

      report.websiteAnalyses.forEach(analysis => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.text(`URL: ${analysis.url}`, 20, y);
        y += 7;
        doc.text(`Performance Score: ${analysis.metrics.performance}`, 30, y);
        y += 7;
        doc.text(`SEO Score: ${analysis.metrics.seo}`, 30, y);
        y += 7;
        doc.text(`Accessibility Score: ${analysis.metrics.accessibility}`, 30, y);
        y += 10;
      });
    }

    // Social Media Analyses
    if (report.socialAnalyses.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(16);
      doc.text('Social Media Analyses', 20, y);
      y += 10;

      report.socialAnalyses.forEach(analysis => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.text(`Brand: ${analysis.brand}`, 20, y);
        y += 7;
        doc.text(`Total Mentions: ${analysis.data.summary.totalMentions}`, 30, y);
        y += 7;
        doc.text('Sentiment Distribution:', 30, y);
        y += 7;
        Object.entries(analysis.data.summary.sentiment).forEach(([sentiment, count]) => {
          doc.text(`${sentiment}: ${count}`, 40, y);
          y += 7;
        });
        y += 10;
      });
    }

    // News Analyses
    if (report.newsAnalyses.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(16);
      doc.text('News Analyses', 20, y);
      y += 10;

      report.newsAnalyses.forEach(analysis => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.text(`Query: ${analysis.query}`, 20, y);
        y += 7;
        doc.text(`Total Articles: ${analysis.data.summary.totalArticles}`, 30, y);
        y += 7;
        doc.text('Top Sources:', 30, y);
        y += 7;
        analysis.data.summary.topSources.forEach(source => {
          doc.text(`${source.source}: ${source.count} articles`, 40, y);
          y += 7;
        });
        y += 10;
      });
    }
  }

  doc.save(`${report.name.toLowerCase().replace(/\s+/g, '-')}-${report.id}.pdf`);
}