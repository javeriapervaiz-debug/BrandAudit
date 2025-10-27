// @ts-nocheck
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

export class FixedScreenshotAnnotator {
  constructor() {
    this.issueTypes = {
      typography: { color: '#FF6B6B', label: 'Typography Issue' },
      logo: { color: '#4ECDC4', label: 'Logo Issue' },
      colors: { color: '#45B7D1', label: 'Color Issue' },
      layout: { color: '#96CEB4', label: 'Layout Issue' },
      spacing: { color: '#FFA726', label: 'Spacing Issue' }
    };
    
    // Track badge positions to prevent overlap
    this.badgePositions = new Map();
  }

  async createTargetedAnnotations(screenshotPath, auditResults, elementPositions) {
    console.log('🎯 Creating IMPROVED targeted annotations...');
    
    const image = await loadImage(screenshotPath);
    
    // Expand canvas with margins
    const marginTop = 120;
    const marginBottom = 40;
    const canvas = createCanvas(image.width, image.height + marginTop + marginBottom);
    const ctx = canvas.getContext('2d');
    
    // White background + draw screenshot shifted down
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, marginTop);
    
    // Reset badge positions for this annotation
    this.badgePositions.clear();
    
    // Check if element positions exist and are valid
    if (!elementPositions || elementPositions.length === 0) {
      console.warn('⚠️ No element positions provided - skipping highlights');
      this.addTargetedLegend(ctx, 20, 20, {}, []);
      this.addScoreOverlay(ctx, canvas.width - 300, 20, auditResults.overallScore);
      
      const annotatedPath = screenshotPath.replace('.png', '-targeted.png');
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(annotatedPath, buffer);
      return annotatedPath;
    }
    
    // Process issues with improved positioning
    const issues = auditResults.issues || [];
    const { highlightableIssues, nonHighlightableIssues } = this.filterHighlightableIssues(issues, elementPositions);
    const groupedIssues = this.groupIssuesByCategory(highlightableIssues);
    
    console.log(`📊 Found ${highlightableIssues.length} highlightable issues and ${nonHighlightableIssues.length} non-highlightable issues`);
    
    // Annotate issues with proper positioning
    let issueCounter = 1;
    Object.keys(groupedIssues).forEach(category => {
      const categoryIssues = groupedIssues[category];
      if (categoryIssues.length > 0) {
        issueCounter = this.annotateCategoryIssues(
          ctx, 
          category, 
          categoryIssues, 
          elementPositions, 
          issueCounter, 
          marginTop, 
          image.width, 
          image.height
        );
      }
    });
    
    // Add legend and score
    this.addTargetedLegend(ctx, 20, 20, groupedIssues, nonHighlightableIssues);
    this.addScoreOverlay(ctx, canvas.width - 300, 20, auditResults.overallScore);
    
    const annotatedPath = screenshotPath.replace('.png', '-targeted.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(annotatedPath, buffer);
    
    console.log(`✅ Improved annotations created: ${annotatedPath}`);
    return annotatedPath;
  }

  filterHighlightableIssues(issues, elementPositions) {
    const highlightableIssues = [];
    const nonHighlightableIssues = [];
    
    issues.forEach(issue => {
      const category = this.determineIssueCategory(issue);
      const relevantElements = this.findElementsForIssue(issue, elementPositions, category);
      
      if (relevantElements.length > 0) {
        highlightableIssues.push({
          ...issue,
          _category: category,
          _elements: relevantElements
        });
      } else {
        nonHighlightableIssues.push({
          ...issue,
          _category: category,
          _reason: 'No relevant elements found'
        });
      }
    });
    
    return { highlightableIssues, nonHighlightableIssues };
  }

  determineIssueCategory(issue) {
    const issueText = (issue.message || issue.description || '').toLowerCase();
    const issueType = (issue.type || '').toLowerCase();
    
    if (issueText.includes('font') || issueText.includes('typography') || 
        issueText.includes('text') || issueText.includes('heading') ||
        issueType.includes('font') || issueType.includes('typography')) {
      return 'typography';
    }
    
    if ((issueText.includes('logo') && !issueText.includes('color')) || 
        (issueText.includes('brand') && issueText.includes('logo')) ||
        issueType.includes('logo_missing') || issueType.includes('logo_not_detected')) {
      return 'logo';
    }
    
    if ((issueText.includes('color') && !issueText.includes('logo')) ||
        issueText.includes('palette') || issueText.includes('secondary color') ||
        issueText.includes('brand color') || issueText.includes('official color') ||
        issueType.includes('color') || issueType.includes('palette')) {
      return 'colors';
    }
    
    if (issueText.includes('spacing') || issueText.includes('margin') ||
        issueText.includes('padding') || issueType.includes('spacing')) {
      return 'spacing';
    }
    
    return 'layout';
  }

  findElementsForIssue(issue, elementPositions, category) {
    let relevantElements = [];
    
    switch (category) {
      case 'typography':
        relevantElements = this.findTypographyElements(issue, elementPositions);
        break;
      case 'logo':
        relevantElements = this.findLogoElements(issue, elementPositions);
        break;
      case 'colors':
        relevantElements = this.findColorElements(issue, elementPositions);
        break;
      case 'spacing':
        relevantElements = this.findSpacingElements(issue, elementPositions);
        break;
      default:
        relevantElements = this.findGenericElements(issue, elementPositions);
    }
    
    return this.applyStrictFiltering(relevantElements, issue, category);
  }

  findTypographyElements(issue, elements) {
    const textElements = elements.filter(el => {
      if (!el.text || el.text.trim().length === 0) return false;
      
      const isTextElement = el.tag && (
        el.tag.match(/^h[1-6]$/i) || 
        el.tag === 'p' || 
        el.tag === 'span' ||
        (el.tag === 'div' && el.text.length < 500)
      );
      
      const hasTextClasses = el.classes && (
        el.classes.toLowerCase().includes('text') ||
        el.classes.toLowerCase().includes('heading') ||
        el.classes.toLowerCase().includes('title') ||
        el.classes.toLowerCase().includes('font')
      );
      
      return isTextElement || hasTextClasses;
    });
    
    return this.removeDuplicateElements(textElements);
  }

  findLogoElements(issue, elements) {
    const logoElements = elements.filter(el => {
      if (el.tag === 'img') {
        const hasLogoIndicators = (
          el.classes?.toLowerCase().includes('logo') ||
          el.id?.toLowerCase().includes('logo') ||
          el.alt?.toLowerCase().includes('logo') ||
          (el.src && el.src.toLowerCase().includes('logo'))
        );
        return hasLogoIndicators;
      }
      
      if ((el.tag === 'h1' || el.tag === 'div') && el.text) {
        const isShortText = el.text.length <= 3;
        const hasLogoClasses = el.classes?.toLowerCase().includes('logo');
        const isInHeader = this.isElementInHeader(el, elements);
        
        return isShortText && (hasLogoClasses || isInHeader);
      }
      
      return false;
    });
    
    return this.removeDuplicateElements(logoElements);
  }

  findColorElements(issue, elements) {
    const colorElements = elements.filter(el => {
      const isColorElement = (
        el.tag === 'button' ||
        el.classes?.toLowerCase().includes('button') ||
        el.classes?.toLowerCase().includes('btn') ||
        (el.tag === 'nav' && el.position.width > 200) ||
        el.tag === 'header' ||
        el.tag === 'footer' ||
        (el.classes && (
          el.classes.toLowerCase().includes('primary') ||
          el.classes.toLowerCase().includes('secondary') ||
          el.classes.toLowerCase().includes('accent') ||
          el.classes.toLowerCase().includes('brand')
        ))
      );
      
      return isColorElement;
    });
    
    return this.removeDuplicateElements(colorElements);
  }

  findSpacingElements(issue, elements) {
    const spacingElements = elements.filter(el => {
      const isLayoutElement = (
        el.tag === 'div' ||
        el.tag === 'section' ||
        el.tag === 'article' ||
        el.classes?.toLowerCase().includes('container') ||
        el.classes?.toLowerCase().includes('wrapper') ||
        el.classes?.toLowerCase().includes('grid')
      );
      
      return isLayoutElement && el.position.width > 100;
    });
    
    return this.removeDuplicateElements(spacingElements);
  }

  findGenericElements(issue, elements) {
    return elements.filter(el => {
      const issueText = (issue.message || issue.description || '').toLowerCase();
      const elementText = el.text?.toLowerCase() || '';
      const elementClasses = el.classes?.toLowerCase() || '';
      
      return issueText.includes(elementText) || 
             elementClasses.includes(issueText) ||
             issueText.includes(el.tag);
    });
  }

  applyStrictFiltering(elements, issue, category) {
    return elements.filter(el => {
      switch (category) {
        case 'colors':
          return el.position.width > 50 && el.position.height > 20;
        case 'typography':
          return el.text && el.text.trim().length > 5;
        case 'logo':
          return el.position.y < 300;
        default:
          return true;
      }
    });
  }

  isElementInHeader(element, allElements) {
    return element.position.y < 200;
  }

  groupIssuesByCategory(issues) {
    const grouped = {
      typography: [],
      logo: [],
      colors: [],
      layout: [],
      spacing: []
    };
    
    issues.forEach(issue => {
      const category = issue._category || this.determineIssueCategory(issue);
      if (grouped[category]) {
        grouped[category].push(issue);
      } else {
        grouped.layout.push(issue);
      }
    });
    
    return grouped;
  }

  annotateCategoryIssues(ctx, category, issues, elementPositions, startCounter, marginTop = 0, screenshotWidth = 1920, screenshotHeight = 1080) {
    let issueCounter = startCounter;
    const issueConfig = this.issueTypes[category] || this.issueTypes.layout;
    
    // Calculate scaling factors
    const needsScaling = elementPositions.length > 0 && elementPositions[0].position;
    const viewportWidth = needsScaling ? Math.max(...elementPositions.map(el => el.position.x + el.position.width)) : screenshotWidth;
    const viewportHeight = needsScaling ? Math.max(...elementPositions.map(el => el.position.y + el.position.height)) : screenshotHeight;
    
    const scaleX = screenshotWidth / viewportWidth;
    const scaleY = screenshotHeight / viewportHeight;
    
    issues.forEach(issue => {
      const relevantElements = issue._elements || [];
      
      if (relevantElements.length > 0) {
        console.log(`🔍 Highlighting ${relevantElements.length} elements for ${category} issue: "${issue.message}"`);
        
        // Highlight each relevant element
        relevantElements.forEach(element => {
          this.highlightElement(ctx, element, issueConfig.color, issueCounter, marginTop, scaleX, scaleY);
        });
        
        // Add label for the first relevant element
        if (relevantElements.length > 0) {
          this.addIssueLabel(ctx, relevantElements[0], issue, issueCounter, issueConfig.color, marginTop, scaleX, scaleY);
        }
        
        issueCounter++;
      }
    });
    
    return issueCounter;
  }

  highlightElement(ctx, element, color, issueNumber, marginTop = 0, scaleX = 1, scaleY = 1) {
    const { x, y, width, height } = element.position;
    
    // Scale coordinates to match screenshot dimensions
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    const scaledWidth = width * scaleX;
    const scaledHeight = height * scaleY;
    
    // Adjust position for margin offset
    const adjustedY = scaledY + marginTop;
    
    // Draw highlight rectangle
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(scaledX - 1, adjustedY - 1, scaledWidth + 2, scaledHeight + 2);
    ctx.setLineDash([]);
    
    // Draw issue number badge with collision avoidance
    this.drawIssueBadge(ctx, scaledX, adjustedY, scaledWidth, scaledHeight, issueNumber, color);
  }

  drawIssueBadge(ctx, x, y, width, height, issueNumber, color) {
    const badgeSize = 24;
    
    // Try different positions to avoid overlap
    const positions = [
      { x: x - badgeSize - 8, y: y - 8 }, // Top-left
      { x: x + width + 8, y: y - 8 },     // Top-right
      { x: x - badgeSize - 8, y: y + height - badgeSize + 8 }, // Bottom-left
      { x: x + width + 8, y: y + height - badgeSize + 8 },     // Bottom-right
      { x: x + width/2 - badgeSize/2, y: y - badgeSize - 8 },  // Top-center
    ];
    
    // Find first non-overlapping position
    let badgePosition = null;
    for (const pos of positions) {
      const wouldOverlap = this.checkBadgeOverlap(pos.x, pos.y, badgeSize);
      if (!wouldOverlap) {
        badgePosition = pos;
        break;
      }
    }
    
    // If all positions overlap, use top-left but log warning
    if (!badgePosition) {
      console.warn(`⚠️ Badge overlap detected for issue ${issueNumber}, using fallback position`);
      badgePosition = positions[0];
    }
    
    // Store badge position for collision detection
    this.badgePositions.set(issueNumber, {
      x: badgePosition.x,
      y: badgePosition.y,
      size: badgeSize
    });
    
    // Badge background
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(badgePosition.x + badgeSize/2, badgePosition.y + badgeSize/2, badgeSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Issue number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(issueNumber.toString(), badgePosition.x + badgeSize/2, badgePosition.y + badgeSize/2);
  }

  checkBadgeOverlap(x, y, size) {
    const padding = 5; // Additional padding between badges
    
    for (const [_, existingBadge] of this.badgePositions) {
      const distanceX = Math.abs(x - existingBadge.x);
      const distanceY = Math.abs(y - existingBadge.y);
      
      if (distanceX < size + padding && distanceY < size + padding) {
        return true;
      }
    }
    return false;
  }

  addIssueLabel(ctx, element, issue, issueNumber, color, marginTop = 0, scaleX = 1, scaleY = 1) {
    const { x, y, width } = element.position;
    
    // Scale coordinates
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;
    const scaledWidth = width * scaleX;
    const adjustedY = scaledY + marginTop;
    
    // Calculate label position (try to avoid overlapping other labels)
    let labelX = scaledX + scaledWidth + 20;
    let labelY = adjustedY;
    
    // If label would go off screen, position above the element
    if (labelX + 300 > ctx.canvas.width) {
      labelX = Math.max(10, scaledX - 320);
      labelY = Math.max(10, adjustedY - 60);
    }
    
    // Label background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.fillRect(labelX, labelY, 300, 50);
    ctx.strokeRect(labelX, labelY, 300, 50);
    
    // Issue content
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Truncate long issue messages
    const maxMessageLength = 35;
    let message = issue.message || issue.description || 'Issue detected';
    if (message.length > maxMessageLength) {
      message = message.substring(0, maxMessageLength) + '...';
    }
    
    // Issue header
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Issue #${issueNumber}`, labelX + 10, labelY + 10);
    
    // Issue message
    ctx.font = '12px Arial';
    ctx.fillText(message, labelX + 10, labelY + 30);
  }

  addTargetedLegend(ctx, legendX, legendY, groupedIssues, nonHighlightableIssues = []) {
    // Count issues per category
    const issueCounts = {};
    Object.keys(groupedIssues).forEach(category => {
      issueCounts[category] = groupedIssues[category].length;
    });
    
    const totalHighlightable = Object.values(issueCounts).reduce((a, b) => a + b, 0);
    
    // Calculate legend height based on content
    const categoriesWithIssues = Object.keys(this.issueTypes).filter(cat => issueCounts[cat] > 0).length;
    const legendHeight = 80 + (categoriesWithIssues * 20) + (nonHighlightableIssues.length > 0 ? 25 : 0);
    
    // Legend background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    ctx.fillRect(legendX, legendY, 280, legendHeight);
    ctx.strokeRect(legendX, legendY, 280, legendHeight);
    
    // Legend title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Audit Issues', legendX + 15, legendY + 25);
    
    // Highlightable issues count
    ctx.font = '12px Arial';
    ctx.fillText(`Highlighted: ${totalHighlightable} issues`, legendX + 15, legendY + 45);
    
    // Issue categories with counts
    let yOffset = legendY + 65;
    Object.entries(this.issueTypes).forEach(([category, config]) => {
      const count = issueCounts[category] || 0;
      if (count > 0) {
        // Color indicator
        ctx.fillStyle = config.color;
        ctx.fillRect(legendX + 15, yOffset - 6, 10, 10);
        
        // Category label with count
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.fillText(`${config.label} (${count})`, legendX + 35, yOffset);
        
        yOffset += 20;
      }
    });
    
    // Non-highlightable issues note
    if (nonHighlightableIssues.length > 0) {
      ctx.fillStyle = '#666666';
      ctx.font = 'italic 11px Arial';
      ctx.fillText(`+ ${nonHighlightableIssues.length} additional issues in report`, legendX + 15, yOffset + 10);
    }
  }

  addScoreOverlay(ctx, scoreX, scoreY, overallScore) {
    const scoreColor = this.getScoreColor(overallScore);
    const scoreText = `Compliance: ${Math.round(overallScore * 100)}%`;
    
    // Score background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = scoreColor;
    ctx.lineWidth = 2;
    ctx.fillRect(scoreX, scoreY, 200, 40);
    ctx.strokeRect(scoreX, scoreY, 200, 40);
    
    // Score text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(scoreText, scoreX + 100, scoreY + 25);
  }

  removeDuplicateElements(elements) {
    const uniqueElements = [];
    const seenPositions = new Set();
    
    elements.forEach(element => {
      const positionKey = `${element.position.x},${element.position.y},${element.position.width},${element.position.height}`;
      if (!seenPositions.has(positionKey)) {
        seenPositions.add(positionKey);
        uniqueElements.push(element);
      }
    });
    
    return uniqueElements;
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