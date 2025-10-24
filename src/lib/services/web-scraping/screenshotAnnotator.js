// @ts-nocheck
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

export class ScreenshotAnnotator {
  constructor() {
    this.issueTypes = {
      colors: { color: '#FF6B6B', label: 'Color Issue' },
      typography: { color: '#4ECDC4', label: 'Typography Issue' },
      logo: { color: '#45B7D1', label: 'Logo Issue' },
      layout: { color: '#96CEB4', label: 'Layout Issue' },
      spacing: { color: '#FFA726', label: 'Spacing Issue' }
    };
  }

  async annotateScreenshot(screenshotPath, auditResults, elementPositions = []) {
    try {
      console.log(`🎨 Starting screenshot annotation...`);
      
      const image = await loadImage(screenshotPath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      
      // Draw original screenshot
      ctx.drawImage(image, 0, 0);
      
      // Add annotations for each issue
      if (auditResults.issues && auditResults.issues.length > 0) {
        auditResults.issues.forEach((issue, index) => {
          this.annotateIssue(ctx, issue, index, elementPositions);
        });
      }
      
      // Add legend
      this.addLegend(ctx, canvas.width, canvas.height);
      
      // Add overall score
      this.addScoreOverlay(ctx, canvas.width, auditResults.overallScore || 0);
      
      // Save annotated screenshot
      const annotatedPath = screenshotPath.replace('.png', '-annotated.png');
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(annotatedPath, buffer);
      
      console.log(`✅ Annotated screenshot saved to: ${annotatedPath}`);
      return annotatedPath;
      
    } catch (error) {
      console.error('❌ Screenshot annotation failed:', error);
      throw error;
    }
  }

  annotateIssue(ctx, issue, index, elementPositions) {
    const issueConfig = this.issueTypes[issue.category] || this.issueTypes.layout;
    
    // Find relevant elements for this issue
    const relevantElements = this.findRelevantElements(issue, elementPositions);
    
    if (relevantElements.length > 0) {
      relevantElements.forEach(element => {
        this.drawElementHighlight(ctx, element, issueConfig.color, index + 1);
      });
      
      // Add issue description near the first element
      const firstElement = relevantElements[0];
      this.drawIssueLabel(ctx, firstElement, issue, index + 1, issueConfig.color);
    } else {
      // If no specific elements found, add a general annotation
      this.drawGeneralAnnotation(ctx, issue, index + 1, issueConfig.color);
    }
  }

  findRelevantElements(issue, elementPositions) {
    if (!elementPositions || elementPositions.length === 0) {
      return [];
    }

    switch (issue.category) {
      case 'colors':
        return elementPositions.filter(el => 
          el.styles && el.styles.color && this.isColorElement(el)
        );
      
      case 'typography':
        return elementPositions.filter(el => 
          el.styles && el.styles.fontFamily && this.isTextElement(el)
        );
      
      case 'logo':
        return elementPositions.filter(el => 
          el.tag === 'img' || el.classes.toLowerCase().includes('logo')
        );
      
      case 'layout':
        return elementPositions.filter(el => 
          el.tag === 'header' || el.tag === 'footer' || el.tag === 'nav'
        );
      
      default:
        // Generic matching based on issue message
        return elementPositions.filter(el => 
          this.elementMatchesIssue(el, issue)
        );
    }
  }

  isColorElement(element) {
    return element.styles && (
      element.styles.color !== 'rgb(0, 0, 0)' ||
      element.styles.backgroundColor !== 'rgba(0, 0, 0, 0)'
    );
  }

  isTextElement(element) {
    return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'].includes(element.tag);
  }

  elementMatchesIssue(element, issue) {
    const issueText = issue.message?.toLowerCase() || '';
    const elementText = element.text?.toLowerCase() || '';
    const elementClasses = element.classes?.toLowerCase() || '';
    
    return issueText.includes(elementText) || 
           elementClasses.includes(issueText) ||
           issueText.includes(element.tag);
  }

  drawElementHighlight(ctx, element, color, issueNumber) {
    const { x, y, width, height } = element.position;
    
    // Draw highlight rectangle
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);
    
    // Draw corner markers
    const markerSize = 8;
    ctx.fillStyle = color;
    
    // Top-left
    ctx.fillRect(x - markerSize/2, y - markerSize/2, markerSize, markerSize);
    // Top-right
    ctx.fillRect(x + width - markerSize/2, y - markerSize/2, markerSize, markerSize);
    // Bottom-left
    ctx.fillRect(x - markerSize/2, y + height - markerSize/2, markerSize, markerSize);
    // Bottom-right
    ctx.fillRect(x + width - markerSize/2, y + height - markerSize/2, markerSize, markerSize);
    
    // Draw issue number badge
    this.drawIssueBadge(ctx, x, y, issueNumber, color);
  }

  drawIssueBadge(ctx, x, y, issueNumber, color) {
    const badgeSize = 24;
    const badgeX = x - badgeSize;
    const badgeY = y - badgeSize;
    
    // Badge background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(badgeX + badgeSize/2, badgeY + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Issue number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(issueNumber.toString(), badgeX + badgeSize/2, badgeY + badgeSize/2);
  }

  drawIssueLabel(ctx, element, issue, issueNumber, color) {
    const { x, y, width } = element.position;
    const labelX = x + width + 10;
    const labelY = y;
    
    // Label background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(labelX, labelY, 300, 80);
    ctx.strokeRect(labelX, labelY, 300, 80);
    
    // Issue text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Issue number and category
    ctx.fillText(`Issue #${issueNumber}: ${issue.category}`, labelX + 10, labelY + 10);
    
    // Issue message (truncated)
    ctx.font = '12px Arial';
    const message = issue.message && issue.message.length > 50 ? 
      issue.message.substring(0, 50) + '...' : (issue.message || 'No description');
    ctx.fillText(message, labelX + 10, labelY + 35);
    
    // Severity
    ctx.fillStyle = this.getSeverityColor(issue.severity);
    ctx.fillText(`Severity: ${issue.severity}`, labelX + 10, labelY + 55);
  }

  drawGeneralAnnotation(ctx, issue, issueNumber, color) {
    // Draw a general annotation in the top-left area
    const x = 50;
    const y = 50 + (issueNumber - 1) * 100;
    
    // Issue marker
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Issue number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(issueNumber.toString(), x, y);
    
    // Issue label
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(x + 25, y - 20, 300, 60);
    ctx.strokeRect(x + 25, y - 20, 300, 60);
    
    // Issue text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Issue #${issueNumber}: ${issue.category}`, x + 35, y - 5);
    
    ctx.font = '12px Arial';
    const message = issue.message && issue.message.length > 50 ? 
      issue.message.substring(0, 50) + '...' : (issue.message || 'No description');
    ctx.fillText(message, x + 35, y + 15);
  }

  addLegend(ctx, canvasWidth, canvasHeight) {
    const legendX = 20;
    const legendY = canvasHeight - 150;
    
    // Legend background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(legendX, legendY, 200, 130);
    ctx.strokeStyle = '#CCCCCC';
    ctx.strokeRect(legendX, legendY, 200, 130);
    
    // Legend title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Audit Issues Legend', legendX + 10, legendY + 25);
    
    // Issue type items
    let yOffset = legendY + 50;
    Object.entries(this.issueTypes).forEach(([type, config]) => {
      // Color indicator
      ctx.fillStyle = config.color;
      ctx.fillRect(legendX + 10, yOffset - 8, 12, 12);
      
      // Label
      ctx.fillStyle = '#333333';
      ctx.font = '12px Arial';
      ctx.fillText(config.label, legendX + 30, yOffset);
      
      yOffset += 20;
    });
  }

  addScoreOverlay(ctx, canvasWidth, overallScore) {
    const scoreColor = this.getScoreColor(overallScore);
    const scoreText = `Overall Compliance: ${Math.round(overallScore * 100)}%`;
    
    // Score background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(canvasWidth - 250, 20, 230, 60);
    ctx.strokeStyle = scoreColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(canvasWidth - 250, 20, 230, 60);
    
    // Score text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(scoreText, canvasWidth - 135, 45);
    
    // Score bar
    const barWidth = 200;
    const barHeight = 12;
    const barX = canvasWidth - 225;
    const barY = 55;
    
    // Background bar
    ctx.fillStyle = '#EEEEEE';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Progress bar
    ctx.fillStyle = scoreColor;
    ctx.fillRect(barX, barY, barWidth * overallScore, barHeight);
  }

  getSeverityColor(severity) {
    const colors = {
      high: '#FF6B6B',
      medium: '#FFA726',
      low: '#42A5F5'
    };
    return colors[severity] || '#666666';
  }

  getScoreColor(score) {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#FFA726';
    return '#FF6B6B';
  }
}
