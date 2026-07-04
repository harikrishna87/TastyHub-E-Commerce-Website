export interface RecentRequest {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  ip: string;
}

export interface EndpointMetric {
  total: number;
  errors: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
}

class MetricsTracker {
  private totalRequests: number = 0;
  private activeRequests: number = 0;
  private statusCodes: { [key: string]: number } = {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
  };
  private totalResponseTime: number = 0;
  private minResponseTime: number = Infinity;
  private maxResponseTime: number = 0;
  private endpoints: { [key: string]: EndpointMetric } = {};
  private recentRequests: RecentRequest[] = [];
  private readonly MAX_RECENT_REQUESTS = 10;

  public incrementActive(): void {
    this.activeRequests++;
  }

  public decrementActive(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
  }

  public recordRequest(
    method: string,
    path: string,
    routePattern: string,
    statusCode: number,
    responseTime: number,
    ip: string
  ): void {
    this.totalRequests++;
    
    // Status code class classification
    const codeClass = `${Math.floor(statusCode / 100)}xx`;
    if (codeClass in this.statusCodes) {
      this.statusCodes[codeClass]++;
    } else {
      this.statusCodes[codeClass] = 1;
    }

    // Response times
    this.totalResponseTime += responseTime;
    if (responseTime < this.minResponseTime) this.minResponseTime = responseTime;
    if (responseTime > this.maxResponseTime) this.maxResponseTime = responseTime;

    // Endpoint aggregation (using routePattern like GET /api/products/:id to prevent cardinality explosion)
    const endpointKey = `${method.toUpperCase()} ${routePattern}`;
    const isError = statusCode >= 400;

    if (!this.endpoints[endpointKey]) {
      this.endpoints[endpointKey] = {
        total: 0,
        errors: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: responseTime,
        maxTime: responseTime,
      };
    }

    const endpoint = this.endpoints[endpointKey];
    endpoint.total++;
    if (isError) endpoint.errors++;
    endpoint.totalTime += responseTime;
    endpoint.avgTime = endpoint.totalTime / endpoint.total;
    if (responseTime < endpoint.minTime) endpoint.minTime = responseTime;
    if (responseTime > endpoint.maxTime) endpoint.maxTime = responseTime;

    // Add to recent requests
    const newRequest: RecentRequest = {
      id: Math.random().toString(36).substring(2, 9),
      method,
      path,
      statusCode,
      responseTime,
      timestamp: new Date().toISOString(),
      ip: ip || 'unknown',
    };

    this.recentRequests.unshift(newRequest);
    if (this.recentRequests.length > this.MAX_RECENT_REQUESTS) {
      this.recentRequests.pop();
    }
  }

  public getStats() {
    return {
      totalRequests: this.totalRequests,
      activeRequests: this.activeRequests,
      statusCodes: { ...this.statusCodes },
      avgResponseTime: this.totalRequests > 0 ? this.totalResponseTime / this.totalRequests : 0,
      minResponseTime: this.minResponseTime === Infinity ? 0 : this.minResponseTime,
      maxResponseTime: this.maxResponseTime,
      endpoints: { ...this.endpoints },
      recentRequests: [...this.recentRequests],
    };
  }
}

export const metricsTracker = new MetricsTracker();
