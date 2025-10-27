<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { AlertTriangle, CheckCircle, XCircle, Info, ExternalLink, Copy, Check, ChevronDown, ChevronRight, Maximize2 } from 'lucide-svelte';
  import FullscreenScreenshotModal from './FullscreenScreenshotModal.svelte';

  export let auditData: any;
  export let websiteUrl: string;
  export let brandName: string;
  export let screenshot: string | null = null;
  export let visualData: any = null;

  // Copy functionality
  let copiedItems: Set<string> = new Set();
  let expandedSections: Set<string> = new Set();
  
  // Visual audit functionality
  let selectedIssue: any = null;
  let showAllHighlights = true;
  let showVisualAudit = false;
  let showFullscreenModal = false;


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

  // Visual audit functions
  function selectIssue(issue: any) {
    selectedIssue = selectedIssue === issue ? null : issue;
  }

  function openFullscreenModal() {
    showFullscreenModal = true;
  }

  function closeFullscreenModal() {
    showFullscreenModal = false;
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
      borderColor: colors[issue.category as keyof typeof colors] || '#666666',
      borderWidth: issue.severity === 'high' ? '3px' : issue.severity === 'medium' ? '2px' : '1px'
    };
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

  // Group issues by category and selector
  function groupIssues(issues: any[]) {
    const grouped: Record<string, any> = {};
    
    issues.forEach(issue => {
      const key = `${issue.category}_${issue.element || 'general'}`;
      if (!grouped[key]) {
        grouped[key] = {
          category: issue.category,
          element: issue.element || 'general',
          severity: issue.severity || 'medium',
          issues: [],
          elements: new Set()
        };
      }
      grouped[key].issues.push(issue);
      if (issue.element) {
        grouped[key].elements.add(issue.element);
      }
    });

    // Clean up elements
    Object.values(grouped).forEach((group: any) => {
      group.elements = Array.from(group.elements);
    });

    return grouped;
  }

  // Get severity color
  function getSeverityColor(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  }


  // Check if issue is color-related
  function isColorIssue(issue: any): boolean {
    return issue.category === 'colors' || 
           issue.cssProperty?.includes('color') || 
           issue.property?.includes('color');
  }

  // Get color value for swatch
  function getColorValue(issue: any): string {
    return issue.expected || issue.correctValue || issue.found || '#000000';
  }

  // Generate summary statistics
  function getSummaryStats() {
    const issues = auditData?.issues || [];
    const grouped = groupIssues(issues);
    
    const stats = {
      total: issues.length,
      byCategory: {} as Record<string, number>,
      bySeverity: { high: 0, medium: 0, low: 0 }
    };

    Object.values(grouped).forEach((group: any) => {
      const category = group.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + group.issues.length;
      
      const severity = group.severity?.toLowerCase() || 'medium';
      if (severity === 'high') stats.bySeverity.high++;
      else if (severity === 'medium') stats.bySeverity.medium++;
      else stats.bySeverity.low++;
    });

    return stats;
  }

  const groupedIssues = groupIssues(auditData?.issues || []);
  const summaryStats = getSummaryStats();
</script>

<div class="space-y-6">
  <!-- Header with Overall Score -->
  <Card class="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
    <CardHeader>
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="text-2xl font-bold text-gray-900">
            Brand Compliance Analysis
          </CardTitle>
          <CardDescription class="text-gray-600 mt-2">
            Analysis for <strong>{brandName}</strong> • {websiteUrl}
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

  <!-- Website Screenshot with Visual Audit -->
  {#if screenshot || visualData?.annotatedScreenshot}
    <Card class="bg-gray-50 border-gray-200">
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="text-lg font-semibold text-gray-900 flex items-center">
              📸 Website Screenshot
              {#if visualData?.annotatedScreenshot}
                <span class="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Visual Audit Mode
                </span>
              {/if}
            </CardTitle>
            <CardDescription>
              {#if visualData?.annotatedScreenshot}
                Interactive visual reference with issue annotations
              {:else}
                Visual reference for identifying issues on the webpage
              {/if}
            </CardDescription>
          </div>
          {#if visualData?.annotatedScreenshot}
            <div class="flex items-center gap-2">
              <label class="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  bind:checked={showAllHighlights}
                  class="rounded"
                />
                <span>Show Highlights</span>
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
          {/if}
        </div>
      </CardHeader>
      <CardContent>
        <div class="relative">
          <img 
            src={visualData?.annotatedScreenshot || screenshot} 
            alt="Website Screenshot" 
            class="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
            style="max-height: 600px;"
          />
          
          <!-- Interactive highlights overlay for visual audit -->
          {#if visualData?.annotatedScreenshot && showAllHighlights}
            <div class="highlights-overlay">
              {#each auditData?.issues || [] as issue, index}
                {#if issue.elementPositions && issue.elementPositions.length > 0}
                  {#each issue.elementPositions as elementPos, posIndex}
                    <button
                      class="issue-highlight {issue.category} {issue.severity}"
                      style="
                        border-color: {getHighlightStyle(issue).borderColor}; 
                        border-width: {getHighlightStyle(issue).borderWidth};
                        left: {elementPos?.position?.x || 0}px;
                        top: {elementPos?.position?.y || 0}px;
                        width: {elementPos?.position?.width || 100}px;
                        height: {elementPos?.position?.height || 50}px;
                      "
                      onclick={() => selectIssue(issue)}
                      type="button"
                    >
                      <div class="issue-marker">{index + 1}</div>
                    </button>
                  {/each}
                {/if}
              {/each}
            </div>
          {:else if visualData?.annotatedScreenshot}
            <!-- Show message when no element positions are available -->
            <div class="absolute top-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <p class="text-sm text-yellow-800">
                Visual highlights not available - element positions could not be detected
              </p>
            </div>
          {/if}
        </div>
        
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-600">
            {#if visualData?.annotatedScreenshot}
              Click on highlighted areas to see detailed issue information
            {:else}
              Use this screenshot to visually identify the elements mentioned in the issues below
            {/if}
          </p>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card class="bg-red-50 border-red-200">
      <CardContent class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-red-600">{summaryStats.bySeverity.high}</div>
            <div class="text-sm text-red-700">High Priority</div>
          </div>
          <AlertTriangle class="h-8 w-8 text-red-500" />
        </div>
      </CardContent>
    </Card>

    <Card class="bg-orange-50 border-orange-200">
      <CardContent class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-orange-600">{summaryStats.bySeverity.medium}</div>
            <div class="text-sm text-orange-700">Medium Priority</div>
          </div>
          <Info class="h-8 w-8 text-orange-500" />
        </div>
      </CardContent>
    </Card>

    <Card class="bg-yellow-50 border-yellow-200">
      <CardContent class="p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-2xl font-bold text-yellow-600">{summaryStats.bySeverity.low}</div>
            <div class="text-sm text-yellow-700">Low Priority</div>
          </div>
          <Info class="h-8 w-8 text-yellow-500" />
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Category Scores -->
  <Card>
    <CardHeader>
      <CardTitle class="text-lg">Category Scores</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each Object.entries(auditData?.categoryScores || {}) as [category, score]}
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-2">
              <span class="text-lg">{getCategoryIcon(category)}</span>
              <span class="font-medium capitalize">{category}</span>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-blue-600">
                {Math.round((score as number) * 100)}%
              </div>
            </div>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- Issues Section -->
  {#if Object.keys(groupedIssues).length > 0}
    <Card>
      <CardHeader>
        <CardTitle class="text-lg flex items-center">
          <AlertTriangle class="h-5 w-5 text-red-500 mr-2" />
          Issues Found ({summaryStats.total})
        </CardTitle>
        <CardDescription>
          Click on any section to expand and see detailed fixes
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        {#each Object.entries(groupedIssues) as [key, group]}
          {@const sectionId = key}
          {@const isExpanded = expandedSections.has(sectionId)}
          
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <button
              class="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              onclick={() => toggleSection(sectionId)}
            >
              <div class="flex items-center space-x-3">
                <span class="text-lg">{getCategoryIcon(group.category)}</span>
                <div class="text-left">
                  <div class="font-semibold text-gray-900 capitalize">
                    {group.category} — {group.element}
                  </div>
                  <div class="text-sm text-gray-600">
                    {group.issues.length} issue{group.issues.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs rounded {getSeverityColor(group.severity)}">
                  {group.severity}
                </span>
                {#if isExpanded}
                  <ChevronDown class="h-4 w-4 text-gray-500" />
                {:else}
                  <ChevronRight class="h-4 w-4 text-gray-500" />
                {/if}
              </div>
            </button>

            {#if isExpanded}
              <div class="p-4 bg-white border-t border-gray-200">
                <!-- Issues List -->
                <div class="space-y-3 mb-4">
                  {#each group.issues as issue}
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div class="flex-1">
                        <div class="font-medium text-gray-900">
                          {issue.message || issue.description || `${issue.cssProperty}: ${issue.found} → ${issue.expected}`}
                        </div>
                        {#if isColorIssue(issue)}
                          <div class="flex items-center space-x-4 mt-2">
                            <div class="flex items-center space-x-2">
                              <div class="w-4 h-4 rounded border border-gray-300" style="background-color: {issue.expected || issue.correctValue}"></div>
                              <span class="text-xs text-gray-600">Expected</span>
                            </div>
                            <div class="flex items-center space-x-2">
                              <div class="w-4 h-4 rounded border border-gray-300" style="background-color: {issue.found || issue.actualValue}"></div>
                              <span class="text-xs text-gray-600">Found</span>
                            </div>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/each}
      </CardContent>
    </Card>
  {:else}
    <Card class="bg-green-50 border-green-200">
      <CardContent class="p-8 text-center">
        <CheckCircle class="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-green-800 mb-2">No Issues Found!</h3>
        <p class="text-green-700">
          Your website is fully compliant with the brand guidelines. Great job! 🎉
        </p>
      </CardContent>
    </Card>
  {/if}

  <!-- Recommendations -->
  {#if auditData?.recommendations && auditData.recommendations.length > 0}
    <Card>
      <CardHeader>
        <CardTitle class="text-lg flex items-center">
          <Info class="h-5 w-5 text-blue-500 mr-2" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul class="space-y-2">
          {#each auditData.recommendations as recommendation}
            <li class="flex items-start space-x-2">
              <CheckCircle class="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
              <span class="text-gray-700">{recommendation.message || recommendation.action || recommendation.title || recommendation}</span>
            </li>
          {/each}
        </ul>
      </CardContent>
    </Card>
  {/if}

  <!-- Issue Detail Modal for Visual Audit -->
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

  <!-- Fullscreen Screenshot Modal -->
  <FullscreenScreenshotModal
    isOpen={showFullscreenModal}
    screenshot={screenshot}
    annotatedScreenshot={visualData?.annotatedScreenshot}
    showHighlights={showAllHighlights}
    issues={auditData?.issues || []}
    elementPositions={visualData?.elementPositions || []}
    on:close={closeFullscreenModal}
  />
</div>

<style>
  /* Visual Audit Styles */
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
    background: transparent;
    padding: 0;
    margin: 0;
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
</style>