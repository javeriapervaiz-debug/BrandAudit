<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { X, Maximize2, Minimize2 } from 'lucide-svelte';

  export let isOpen = false;
  export let screenshot: string | null = null;
  export let annotatedScreenshot: string | null = null;
  export let showHighlights = true;
  export let issues: any[] = [];
  export let elementPositions: any[] = [];

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
  }

  function toggleHighlights() {
    showHighlights = !showHighlights;
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
    const icons = {
      colors: '🎨',
      typography: '📝',
      logo: '🏷️',
      layout: '📐',
      spacing: '📏'
    };
    return icons[category as keyof typeof icons] || '⚠️';
  }

  function getSeverityColor(severity: string) {
    const colors = {
      high: '#FF6B6B',
      medium: '#FFA726',
      low: '#42A5F5'
    };
    return colors[severity as keyof typeof colors] || '#666666';
  }

  // Prevent body scroll when modal is open
  $: if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <div 
    class="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="fullscreen-modal-title"
  >
    <!-- Modal Content -->
    <div 
      class="bg-white rounded-lg shadow-2xl max-w-7xl max-h-full w-full h-full flex flex-col"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div class="flex items-center gap-4">
          <h2 id="fullscreen-modal-title" class="text-2xl font-bold text-gray-900">
            📸 Fullscreen Screenshot View
          </h2>
          {#if annotatedScreenshot}
            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Visual Audit Mode
            </span>
          {/if}
        </div>
        
        <div class="flex items-center gap-3">
          {#if annotatedScreenshot}
            <Button
              variant="outline"
              size="sm"
              onclick={toggleHighlights}
              class="flex items-center gap-2"
            >
              {#if showHighlights}
                <Minimize2 class="w-4 h-4" />
                Hide Highlights
              {:else}
                <Maximize2 class="w-4 h-4" />
                Show Highlights
              {/if}
            </Button>
          {/if}
          
          <Button
            variant="outline"
            size="sm"
            onclick={closeModal}
            class="flex items-center gap-2"
          >
            <X class="w-4 h-4" />
            Close
          </Button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="flex-1 overflow-hidden">
        <!-- Fullscreen Screenshot Container with Scroll -->
        <div class="w-full h-full overflow-auto">
          <div class="relative min-h-full flex items-center justify-center p-4">
            {#if showHighlights && annotatedScreenshot}
              <img 
                src={annotatedScreenshot} 
                alt="Fullscreen Annotated Screenshot" 
                class="max-w-none h-auto rounded-lg shadow-lg border border-gray-200"
                style="min-width: 100%;"
              />
            {:else if screenshot}
              <img 
                src={screenshot} 
                alt="Fullscreen Website Screenshot" 
                class="max-w-none h-auto rounded-lg shadow-lg border border-gray-200"
                style="min-width: 100%;"
              />
            {:else}
              <div class="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <p class="text-gray-500 text-lg">No screenshot available</p>
              </div>
            {/if}
            
            <!-- Interactive highlights overlay -->
            {#if showHighlights && annotatedScreenshot && elementPositions && elementPositions.length > 0}
              <div class="highlights-overlay absolute inset-0 pointer-events-none">
                {#each elementPositions as elementPos, index}
                  {@const issue = issues?.[index]}
                  {#if issue}
                    <div
                      class="issue-highlight absolute border-2 border-dashed cursor-pointer transition-all duration-200 hover:opacity-80"
                      style="
                        border-color: {getHighlightStyle(issue).borderColor}; 
                        border-width: {getHighlightStyle(issue).borderWidth};
                        left: {elementPos?.position?.x || 0}px;
                        top: {elementPos?.position?.y || 0}px;
                        width: {elementPos?.position?.width || 100}px;
                        height: {elementPos?.position?.height || 50}px;
                      "
                      role="button"
                      tabindex="0"
                      onclick={(e) => {
                        e.stopPropagation();
                        console.log('Issue clicked:', issue);
                      }}
                    >
                      <div class="issue-marker absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                           style="background-color: {getHighlightStyle(issue).borderColor};">
                        {index + 1}
                      </div>
                    </div>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center justify-center">
          <div class="text-sm text-gray-500">
            {#if annotatedScreenshot}
              Click on highlighted areas to see detailed issue information • Scroll to view full image • Press ESC to close
            {:else}
              Use this screenshot to visually identify elements • Scroll to view full image • Press ESC to close
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .highlights-overlay {
    pointer-events: none;
  }
  
  .issue-highlight {
    pointer-events: auto;
  }
  
  .issue-marker {
    pointer-events: none;
  }
  
  /* Ensure modal is above everything */
  :global(.fullscreen-modal) {
    z-index: 9999;
  }
</style>
