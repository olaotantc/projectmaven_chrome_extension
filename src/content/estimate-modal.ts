import { EstimateData, SOWData, EstimateTask } from '../types';

export class EstimateModal {
  private modal: HTMLElement | null = null;
  private estimateData: EstimateData | null = null;

  constructor() {
    this.createModal();
  }

  private createModal(): void {
    // Create modal container
    this.modal = document.createElement('div');
    this.modal.id = 'pm-estimate-modal';
    this.modal.className = 'pm-modal pm-modal-hidden';
    
    this.modal.innerHTML = `
      <div class="pm-modal-backdrop" id="pm-modal-backdrop"></div>
      <div class="pm-modal-content">
        <div class="pm-modal-header">
          <h2>📊 Project Estimate</h2>
          <button class="pm-modal-close" id="pm-modal-close">&times;</button>
        </div>
        
        <div class="pm-modal-body">
          <div id="pm-estimate-loading" class="pm-estimate-loading">
            <div class="pm-spinner"></div>
            <p>Analyzing project requirements...</p>
          </div>
          
          <div id="pm-estimate-content" class="pm-estimate-content pm-hidden">
            <div class="pm-estimate-summary">
              <div class="pm-estimate-item">
                <span class="pm-label">Total Cost:</span>
                <span class="pm-value pm-cost" id="pm-total-cost">$0</span>
              </div>
              <div class="pm-estimate-item">
                <span class="pm-label">Development Time:</span>
                <span class="pm-value" id="pm-dev-time">0 days</span>
              </div>
              <div class="pm-estimate-item">
                <span class="pm-label">Hourly Rate:</span>
                <span class="pm-value" id="pm-hourly-rate">$0/hr</span>
              </div>
            </div>
            
            <div class="pm-estimate-breakdown">
              <h3>📋 Task Breakdown</h3>
              <div id="pm-task-list" class="pm-task-list"></div>
            </div>
            
            <div class="pm-estimate-actions">
              <button id="pm-generate-sow" class="pm-btn pm-btn-primary">
                📄 Generate Statement of Work
              </button>
              <button id="pm-copy-estimate" class="pm-btn pm-btn-secondary">
                📋 Copy Estimate
              </button>
            </div>
          </div>
          
          <div id="pm-estimate-error" class="pm-estimate-error pm-hidden">
            <div class="pm-error-icon">⚠️</div>
            <h3>Estimation Failed</h3>
            <p id="pm-error-message">Unable to generate estimate. Please try again.</p>
            <button id="pm-retry-estimate" class="pm-btn pm-btn-secondary">Try Again</button>
          </div>
        </div>
        
        <div class="pm-modal-footer">
          <p class="pm-disclaimer">
            <small>🔒 Powered by Projectmaven AI • Not affiliated with Upwork</small>
          </p>
        </div>
      </div>
    `;

    // Append to body
    document.body.appendChild(this.modal);
    
    // Add event listeners
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    if (!this.modal) return;

    // Close modal events
    const closeBtn = this.modal.querySelector('#pm-modal-close');
    const backdrop = this.modal.querySelector('#pm-modal-backdrop');
    
    closeBtn?.addEventListener('click', () => this.hide());
    backdrop?.addEventListener('click', () => this.hide());

    // Action buttons
    const generateSOWBtn = this.modal.querySelector('#pm-generate-sow');
    const copyEstimateBtn = this.modal.querySelector('#pm-copy-estimate');
    const retryBtn = this.modal.querySelector('#pm-retry-estimate');

    generateSOWBtn?.addEventListener('click', () => this.generateSOW());
    copyEstimateBtn?.addEventListener('click', () => this.copyEstimate());
    retryBtn?.addEventListener('click', () => this.retryEstimate());

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  }

  public show(): void {
    if (!this.modal) return;
    
    this.modal.classList.remove('pm-modal-hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Show loading state
    this.showLoading();
  }

  public hide(): void {
    if (!this.modal) return;
    
    this.modal.classList.add('pm-modal-hidden');
    document.body.style.overflow = ''; // Restore scrolling
  }

  public isVisible(): boolean {
    return this.modal ? !this.modal.classList.contains('pm-modal-hidden') : false;
  }

  private showLoading(): void {
    this.hideAll();
    const loading = this.modal?.querySelector('#pm-estimate-loading');
    loading?.classList.remove('pm-hidden');
  }

  private showContent(): void {
    this.hideAll();
    const content = this.modal?.querySelector('#pm-estimate-content');
    content?.classList.remove('pm-hidden');
  }

  private showError(message: string): void {
    this.hideAll();
    const errorDiv = this.modal?.querySelector('#pm-estimate-error');
    const errorMessage = this.modal?.querySelector('#pm-error-message');
    
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    errorDiv?.classList.remove('pm-hidden');
  }

  private hideAll(): void {
    const sections = ['#pm-estimate-loading', '#pm-estimate-content', '#pm-estimate-error'];
    sections.forEach(selector => {
      const element = this.modal?.querySelector(selector);
      element?.classList.add('pm-hidden');
    });
  }

  public displayEstimate(estimateData: EstimateData): void {
    this.estimateData = estimateData;
    
    // Update summary
    const totalCost = this.modal?.querySelector('#pm-total-cost');
    const devTime = this.modal?.querySelector('#pm-dev-time');
    const hourlyRate = this.modal?.querySelector('#pm-hourly-rate');

    if (totalCost) totalCost.textContent = `$${estimateData.totalCost.toLocaleString()}`;
    if (devTime) devTime.textContent = `${estimateData.devDays} days`;
    if (hourlyRate) hourlyRate.textContent = `$${estimateData.hourlyRate}/hr`;

    // Update task breakdown
    const taskList = this.modal?.querySelector('#pm-task-list');
    if (taskList && estimateData.tasks) {
      taskList.innerHTML = estimateData.tasks.map((task: EstimateTask) => `
        <div class="pm-task-item">
          <div class="pm-task-header">
            <span class="pm-task-name">${task.name}</span>
            <span class="pm-task-cost">$${task.cost.toLocaleString()}</span>
          </div>
          <div class="pm-task-details">
            <span class="pm-task-hours">${task.hours}h</span>
            <span class="pm-task-description">${task.description}</span>
          </div>
        </div>
      `).join('');
    }

    this.showContent();
  }

  public displayError(message: string): void {
    this.showError(message);
  }

  private async generateSOW(): Promise<void> {
    if (!this.estimateData) return;

    try {
      // Show loading on SOW button
      const sowBtn = this.modal?.querySelector('#pm-generate-sow') as HTMLButtonElement;
      if (sowBtn) {
        sowBtn.disabled = true;
        sowBtn.textContent = '⏳ Generating SOW...';
      }

      // Send message to background script to generate SOW
      const response = await chrome.runtime.sendMessage({
        action: 'generateSOW',
        estimateId: this.estimateData.id
      });

      if (response.success) {
        this.downloadSOW(response.data);
        
        // Track SOW generation
        await chrome.runtime.sendMessage({
          action: 'trackEvent',
          event: 'sow_generated',
          properties: {
            estimateId: this.estimateData.id,
            totalCost: this.estimateData.totalCost
          }
        });
      } else {
        throw new Error(response.error || 'Failed to generate SOW');
      }
    } catch (error) {
      console.error('SOW generation failed:', error);
      alert('Failed to generate Statement of Work. Please try again.');
    } finally {
      // Reset SOW button
      const sowBtn = this.modal?.querySelector('#pm-generate-sow') as HTMLButtonElement;
      if (sowBtn) {
        sowBtn.disabled = false;
        sowBtn.textContent = '📄 Generate Statement of Work';
      }
    }
  }

  private downloadSOW(sowData: SOWData): void {
    // Create and trigger download
    const blob = new Blob([sowData.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projectmaven-sow-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    alert('Statement of Work downloaded successfully!');
  }

  private copyEstimate(): void {
    if (!this.estimateData) return;

    const estimateText = this.formatEstimateForCopy();
    
    navigator.clipboard.writeText(estimateText).then(() => {
      // Show feedback
      const copyBtn = this.modal?.querySelector('#pm-copy-estimate') as HTMLButtonElement;
      if (copyBtn) {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
          copyBtn.textContent = originalText;
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy estimate:', err);
      alert('Failed to copy estimate to clipboard.');
    });
  }

  private formatEstimateForCopy(): string {
    if (!this.estimateData) return '';

    let text = `Project Estimate - Generated by Projectmaven\n\n`;
    text += `Total Cost: $${this.estimateData.totalCost.toLocaleString()}\n`;
    text += `Development Time: ${this.estimateData.devDays} days\n`;
    text += `Hourly Rate: $${this.estimateData.hourlyRate}/hr\n\n`;
    
    if (this.estimateData.tasks) {
      text += `Task Breakdown:\n`;
      this.estimateData.tasks.forEach((task: EstimateTask) => {
        text += `• ${task.name}: $${task.cost.toLocaleString()} (${task.hours}h)\n`;
        text += `  ${task.description}\n\n`;
      });
    }
    
    text += `Generated on: ${new Date().toLocaleDateString()}\n`;
    text += `Powered by Projectmaven • Not affiliated with Upwork`;
    
    return text;
  }

  private retryEstimate(): void {
    // Trigger estimate regeneration
    const event = new CustomEvent('pm-retry-estimate');
    document.dispatchEvent(event);
    this.showLoading();
  }

  public destroy(): void {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
    }
    document.body.style.overflow = ''; // Restore scrolling
  }
} 