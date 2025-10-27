<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { AlertTriangle, CheckCircle, XCircle, Info, ExternalLink, Copy, Check, ChevronDown, ChevronRight, Eye, EyeOff, Maximize2 } from 'lucide-svelte';
  import FullscreenScreenshotModal from './FullscreenScreenshotModal.svelte';

  export let auditData;
  export let websiteUrl;
  export let brandName;
  export let visualData = null;

  // State management
  let selectedIssue = null;
  let showAllHighlights = true;
  let copiedItems: Set<string> = new Set();
  let expandedSections: Set<string> = new Set();
  let showFullscreenModal = false;

  // Copy functionality
  async function copyToClipboard(text: string, itemId: string) {
    try {
      await navigator.clipboard.writeText(text);
      copiedItems.add(itemId);
      setTimeout(() => copiedItems.delete(itemId), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  function toggleSection(sectionId: string) {
    if (expandedSections.has(sectionId)) {
      expandedSections.delete(sectionId);
    } else {
      expandedSections.add(sectionId);
    }
    expandedSections = expandedSections; // Trigger reactivity
  }

  function selectIssue(issue: any) {
    selectedIssue = selectedIssue === issue ? null : issue;
  }

  function openFullscreenModal() {
    showFullscreenModal = true;
  }

  function closeFullscreenModal() {
    showFullscreenModal = false;
  }

  function getIssueCoordinates(issue: any) {
    // This would need to be implemented based on your element positioning data
    // For now, return a default coordinate
    return "0,0,100,100";
  }

  function getHighlightStyle(issue: any) {
    const colors = {
      colors: '#FF6B6B',
      typography: '#4ECDC4',
      logo: '#45B7D1',
      layout: '#96CEB4',
      spacing: '#FFA726'
    };
    
    return {
      borderColor: colors[issue.category] || '#666666',
      borderWidth: issue.severity === 'high' ? '3px' : issue.severity === 'medium' ? '2px' : '1px'
    };
  }

  function getSeverityColor(severity: string) {
    const colors = {
      high: '#FF6B6B',
      medium: '#FFA726',
      low: '#42A5F5'
    };
    return colors[severity] || '#666666';
  }

  function getCategoryIcon(category: string) {
    switch (category?.toLowerCase()) {
      case 'colors': return '🎨';
      case 'typography': return '📝';
      case 'logo': return '🏷️';
      case 'layout': return '📐';
      case 'spacing': return '📏';
      default: return '⚠️';
    }
  }

  // Group issues by category
  function groupIssues(issues: any[]) {
    const grouped: Record<string, any> = {};
    
    issues.forEach(issue => {
      const category = issue.category || 'general';
      if (!grouped[category]) {
        grouped[category] = {
          category: category,
          issues: [],
          severity: issue.severity || 'medium'
        };
      }
      grouped[category].issues.push(issue);
    });
    
    return grouped;
  }

  const groupedIssues = groupIssues(auditData?.issues || []);
</script>

<div class="visual-audit-report">
  <!-- Header with Overall Score -->
  <Card class="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="text-2xl font-bold text-gray-900">
            Visual Brand Compliance Audit
          </CardTitle>
          <CardDescription class="text-gray-600 mt-2">
            Interactive analysis for <strong>{brandName}</strong> • {websiteUrl}
          </CardDescription>
        </div>
        <div class="text-right">
          <div class="text-4xl font-bold text-blue-600">
            {Math.round((auditData?.overallScore || 0) * 100)}%
          </div>
          <div class="text-sm text-gray-500">
            {auditData?.overallScore > 0.8 ? 'Excellent' : 
             auditData?.overallScore > 0.6 ? 'Good' : 
             auditData?.overallScore > 0.4 ? 'Needs Improvement' : 'Poor'}
          </div>
        </div>
      </div>
    </CardHeader>
  </Card>

  <!-- Visual Audit Content -->
  <div class="audit-content">
    <!-- Screenshot with Interactive Highlights -->
    <div class="screenshot-container">
      {#if visualData?.annotatedScreenshot}
        <Card class="mb-6">
          <CardHeader>
            <CardTitle class="text-lg font-semibold text-gray-900 flex items-center">
              📸 Annotated Website Screenshot
            </CardTitle>
            <CardDescription>
              Interactive visual reference with issue annotations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div class="relative">
              <img 
                src={visualData.annotatedScreenshot} 
                alt="Annotated webpage screenshot" 
                class="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
                style="max-height: 600px;"
              />
              
              <!-- Interactive highlights overlay -->
              {#if showAllHighlights && visualData.elementPositions && visualData.elementPositions.length > 0}
                <div class="highlights-overlay">
                  {#each visualData.elementPositions as elementPos, index}
                    {@const issue = auditData?.issues?.[index]}
                    {#if issue}
                      <div
                        class="issue-highlight {issue.category} {issue.severity}"
                        style="
                          {getHighlightStyle(issue).borderColor ? `border-color: ${getHighlightStyle(issue).borderColor};` : ''}
                          {getHighlightStyle(issue).borderWidth ? `border-width: ${getHighlightStyle(issue).borderWidth};` : ''}
                          left: {elementPos?.position?.x || 0}px;
                          top: {elementPos?.position?.y || 0}px;
                          width: {elementPos?.position?.width || 100}px;
                          height: {elementPos?.position?.height || 50}px;
                        "
                        onclick={() => selectIssue(issue)}
                        role="button"
                        tabindex="0"
                      >
                        <div class="issue-marker">{index + 1}</div>
                      </div>
                    {/if}
                  {/each}
                </div>
              {/if}
            </div>
            
            <!-- Controls -->
            <div class="mt-4 flex items-center gap-4">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  bind:checked={showAllHighlights}
                  class="rounded"
                />
                <span class="text-sm text-gray-600">Show Issue Highlights</span>
              </label>
              <Button
                variant="outline"
                size="sm"
                onclick={openFullscreenModal}
                class="flex items-center gap-2"
                type="button"
              >
                <Maximize2 class="w-4 h-4" />
                Fullscreen
              </Button>
            </div>
          </CardContent>
        </Card>
      {/if}
    </div>

    <!-- Issues Sidebar -->
    <div class="issues-sidebar">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg font-semibold text-gray-900">
            Detected Issues ({auditData?.issues?.length || 0})
          </CardTitle>
          <CardDescription>
            Click on issues to see details and locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            {#each Object.entries(groupedIssues) as [category, group]}
              <div class="issue-category">
                <button
                  class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  onclick={() => toggleSection(category)}
                >
                  <div class="flex items-center gap-2">
                    <span class="text-lg">{getCategoryIcon(category)}</span>
                    <span class="font-medium capitalize">{category}</span>
                    <span class="text-sm text-gray-500">({group.issues.length})</span>
                  </div>
                  {#if expandedSections.has(category)}
                    <ChevronDown class="h-4 w-4" />
                  {:else}
                    <ChevronRight class="h-4 w-4" />
                  {/if}
                </button>
                
                {#if expandedSections.has(category)}
                  <div class="mt-2 space-y-2">
                    {#each group.issues as issue, index}
                      <div
                        class="issue-item {issue.category} {issue.severity} {selectedIssue === issue ? 'selected' : ''}"
                        onclick={() => selectIssue(issue)}
                        role="button"
                        tabindex="0"
                      >
                        <div class="issue-header">
                          <span class="issue-number">#{index + 1}</span>
                          <span class="issue-category capitalize">{issue.category}</span>
                          <span class="issue-severity {issue.severity}">
                            {issue.severity}
                          </span>
                        </div>
                        <div class="issue-message">{issue.message}</div>
                        {#if issue.suggestion}
                          <div class="issue-suggestion">{issue.suggestion}</div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- Issue Detail Modal -->
  {#if selectedIssue}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card class="max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <span class="text-lg">{getCategoryIcon(selectedIssue.category)}</span>
            Issue #{auditData?.issues?.indexOf(selectedIssue) + 1}: {selectedIssue.category}
          </CardTitle>
          <CardDescription>
            Detailed information about this compliance issue
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <h4 class="font-medium text-gray-900 mb-2">Issue Description</h4>
            <p class="text-gray-700">{selectedIssue.message}</p>
          </div>
          
          {#if selectedIssue.suggestion}
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Recommendation</h4>
              <p class="text-gray-700">{selectedIssue.suggestion}</p>
            </div>
          {/if}
          
          <div class="flex items-center gap-4">
            <div>
              <span class="text-sm text-gray-500">Severity:</span>
              <span class="ml-1 px-2 py-1 rounded text-xs font-medium text-white" 
                    style="background-color: {getSeverityColor(selectedIssue.severity)}">
                {selectedIssue.severity}
              </span>
            </div>
            <div>
              <span class="text-sm text-gray-500">Category:</span>
              <span class="ml-1 capitalize">{selectedIssue.category}</span>
            </div>
          </div>
        </CardContent>
        <div class="p-4 border-t">
          <Button onclick={() => selectIssue(null)} class="w-full">
            Close
          </Button>
        </div>
      </Card>
    </div>
  {/if}
</div>

<style>
  .visual-audit-report {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  .audit-content {
    display: flex;
    flex: 1;
    gap: 1rem;
    overflow: hidden;
  }

  .screenshot-container {
    flex: 1;
    overflow: auto;
  }

  .issues-sidebar {
    width: 400px;
    overflow-y: auto;
  }

  .highlights-overlay {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .issue-highlight {
    position: absolute;
    border: 2px dashed;
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.2s ease;
    border-radius: 4px;
  }

  .issue-highlight:hover {
    border-style: solid;
    transform: scale(1.02);
  }

  .issue-highlight.colors { border-color: #FF6B6B; }
  .issue-highlight.typography { border-color: #4ECDC4; }
  .issue-highlight.logo { border-color: #45B7D1; }
  .issue-highlight.layout { border-color: #96CEB4; }
  .issue-highlight.spacing { border-color: #FFA726; }

  .issue-highlight.high { border-width: 3px; }
  .issue-highlight.medium { border-width: 2px; }
  .issue-highlight.low { border-width: 1px; }

  .issue-marker {
    position: absolute;
    top: -12px;
    left: -12px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    color: white;
  }

  .issue-highlight.colors .issue-marker { background: #FF6B6B; }
  .issue-highlight.typography .issue-marker { background: #4ECDC4; }
  .issue-highlight.logo .issue-marker { background: #45B7D1; }
  .issue-highlight.layout .issue-marker { background: #96CEB4; }
  .issue-highlight.spacing .issue-marker { background: #FFA726; }

  .issue-item {
    padding: 1rem;
    margin-bottom: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 4px solid;
  }

  .issue-item.selected {
    background: #e3f2fd;
    transform: translateX(4px);
  }

  .issue-item.colors { border-left-color: #FF6B6B; }
  .issue-item.typography { border-left-color: #4ECDC4; }
  .issue-item.logo { border-left-color: #45B7D1; }
  .issue-item.layout { border-left-color: #96CEB4; }
  .issue-item.spacing { border-left-color: #FFA726; }

  .issue-item.high { background: #ffebee; }
  .issue-item.medium { background: #fff3e0; }
  .issue-item.low { background: #e8f5e8; }

  .issue-header {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    align-items: center;
  }

  .issue-number {
    font-weight: bold;
    color: #666;
  }

  .issue-category {
    text-transform: capitalize;
    font-weight: 500;
  }

  .issue-severity {
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    text-transform: uppercase;
  }

  .issue-severity.high { background: #FF6B6B; color: white; }
  .issue-severity.medium { background: #FFA726; color: white; }
  .issue-severity.low { background: #42A5F5; color: white; }

  .issue-message {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .issue-suggestion {
    font-size: 0.9rem;
    color: #666;
    font-style: italic;
  }
</style>

<!-- Fullscreen Screenshot Modal -->
<FullscreenScreenshotModal
  bind:isOpen={showFullscreenModal}
  screenshot={visualData?.originalScreenshot}
  annotatedScreenshot={visualData?.annotatedScreenshot}
  showHighlights={showAllHighlights}
  issues={auditData?.issues || []}
  elementPositions={visualData?.elementPositions || []}
  on:close={closeFullscreenModal}
/>
