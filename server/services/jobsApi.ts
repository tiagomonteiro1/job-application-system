/**
 * Serviço de Integração com APIs de Vagas
 * Suporta múltiplas fontes: RapidAPI, Adzuna, Web Scraping
 */

import axios from 'axios';

// Tipos
export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  type: string; // CLT, PJ, Remoto, etc.
  url: string;
  source: 'linkedin' | 'indeed' | 'gupy' | 'other';
  postedDate: Date;
  requirements?: string[];
  benefits?: string[];
}

export interface JobSearchParams {
  keywords: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  limit?: number;
}

/**
 * LinkedIn Jobs via RapidAPI
 */
export class LinkedInJobsAPI {
  private apiKey: string;
  private baseURL = 'https://linkedin-data-api.p.rapidapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchJobs(params: JobSearchParams): Promise<JobListing[]> {
    try {
      const response = await axios.get(`${this.baseURL}/search-jobs`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'linkedin-data-api.p.rapidapi.com'
        },
        params: {
          keywords: params.keywords,
          locationId: params.location,
          datePosted: 'anyTime',
          sort: 'mostRelevant',
          start: 0
        }
      });

      return this.parseLinkedInJobs(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas no LinkedIn:', error);
      return [];
    }
  }

  private parseLinkedInJobs(data: any): JobListing[] {
    if (!data || !Array.isArray(data.data)) return [];

    return data.data.map((job: any) => ({
      id: `linkedin-${job.jobId}`,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || '',
      salary: job.salary,
      type: job.workplaceType || 'Presencial',
      url: `https://www.linkedin.com/jobs/view/${job.jobId}`,
      source: 'linkedin' as const,
      postedDate: new Date(job.listedAt),
      requirements: job.skills || [],
      benefits: []
    }));
  }
}

/**
 * Indeed Jobs via RapidAPI
 */
export class IndeedJobsAPI {
  private apiKey: string;
  private baseURL = 'https://indeed12.p.rapidapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchJobs(params: JobSearchParams): Promise<JobListing[]> {
    try {
      const response = await axios.get(`${this.baseURL}/jobs/search`, {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': 'indeed12.p.rapidapi.com'
        },
        params: {
          query: params.keywords,
          location: params.location || 'Brazil',
          page_id: '1',
          locality: 'br',
          fromage: '1',
          radius: '50'
        }
      });

      return this.parseIndeedJobs(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas no Indeed:', error);
      return [];
    }
  }

  private parseIndeedJobs(data: any): JobListing[] {
    if (!data || !Array.isArray(data.hits)) return [];

    return data.hits.map((job: any) => ({
      id: `indeed-${job.id}`,
      title: job.title,
      company: job.company_name,
      location: job.location,
      description: job.description || job.snippet || '',
      salary: job.salary,
      type: job.job_type || 'CLT',
      url: job.link,
      source: 'indeed' as const,
      postedDate: new Date(job.pub_date_ts_milli),
      requirements: [],
      benefits: []
    }));
  }
}

/**
 * Adzuna Jobs API (Gratuita)
 */
export class AdzunaJobsAPI {
  private appId: string;
  private appKey: string;
  private baseURL = 'https://api.adzuna.com/v1/api/jobs';

  constructor(appId: string, appKey: string) {
    this.appId = appId;
    this.appKey = appKey;
  }

  async searchJobs(params: JobSearchParams): Promise<JobListing[]> {
    try {
      const response = await axios.get(`${this.baseURL}/br/search/1`, {
        params: {
          app_id: this.appId,
          app_key: this.appKey,
          what: params.keywords,
          where: params.location || 'Brazil',
          results_per_page: params.limit || 50,
          sort_by: 'relevance'
        }
      });

      return this.parseAdzunaJobs(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas no Adzuna:', error);
      return [];
    }
  }

  private parseAdzunaJobs(data: any): JobListing[] {
    if (!data || !Array.isArray(data.results)) return [];

    return data.results.map((job: any) => ({
      id: `adzuna-${job.id}`,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description,
      salary: job.salary_min && job.salary_max 
        ? `R$ ${job.salary_min} - R$ ${job.salary_max}`
        : undefined,
      type: job.contract_type || 'CLT',
      url: job.redirect_url,
      source: 'other' as const,
      postedDate: new Date(job.created),
      requirements: [],
      benefits: []
    }));
  }
}

/**
 * Gupy Jobs (Web Scraping)
 */
export class GupyJobsAPI {
  private baseURL = 'https://portal.gupy.io/api/v1/jobs';

  async searchJobs(params: JobSearchParams): Promise<JobListing[]> {
    try {
      // Buscar vagas públicas do Gupy
      const response = await axios.get(this.baseURL, {
        params: {
          name: params.keywords,
          limit: params.limit || 50,
          offset: 0
        }
      });

      return this.parseGupyJobs(response.data);
    } catch (error) {
      console.error('Erro ao buscar vagas no Gupy:', error);
      return [];
    }
  }

  private parseGupyJobs(data: any): JobListing[] {
    if (!data || !Array.isArray(data.data)) return [];

    return data.data.map((job: any) => ({
      id: `gupy-${job.id}`,
      title: job.name,
      company: job.careerPageName,
      location: job.city || 'Remoto',
      description: job.description || '',
      salary: undefined,
      type: job.type || 'CLT',
      url: `https://portal.gupy.io/job/${job.id}`,
      source: 'gupy' as const,
      postedDate: new Date(job.publishedDate),
      requirements: job.requirements || [],
      benefits: job.benefits || []
    }));
  }
}

/**
 * Agregador de Vagas
 * Busca em múltiplas fontes e consolida resultados
 */
export class JobAggregator {
  private linkedIn?: LinkedInJobsAPI;
  private indeed?: IndeedJobsAPI;
  private adzuna?: AdzunaJobsAPI;
  private gupy: GupyJobsAPI;

  constructor(config: {
    rapidApiKey?: string;
    adzunaAppId?: string;
    adzunaAppKey?: string;
  }) {
    if (config.rapidApiKey) {
      this.linkedIn = new LinkedInJobsAPI(config.rapidApiKey);
      this.indeed = new IndeedJobsAPI(config.rapidApiKey);
    }

    if (config.adzunaAppId && config.adzunaAppKey) {
      this.adzuna = new AdzunaJobsAPI(config.adzunaAppId, config.adzunaAppKey);
    }

    this.gupy = new GupyJobsAPI();
  }

  async searchAllSources(params: JobSearchParams): Promise<JobListing[]> {
    const promises: Promise<JobListing[]>[] = [];

    // Buscar em todas as fontes disponíveis
    if (this.linkedIn) {
      promises.push(this.linkedIn.searchJobs(params));
    }

    if (this.indeed) {
      promises.push(this.indeed.searchJobs(params));
    }

    if (this.adzuna) {
      promises.push(this.adzuna.searchJobs(params));
    }

    promises.push(this.gupy.searchJobs(params));

    // Executar todas as buscas em paralelo
    const results = await Promise.allSettled(promises);

    // Consolidar resultados
    const allJobs: JobListing[] = [];
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
      }
    });

    // Remover duplicatas
    const uniqueJobs = this.removeDuplicates(allJobs);

    // Ordenar por data (mais recentes primeiro)
    uniqueJobs.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());

    // Limitar resultados
    return uniqueJobs.slice(0, params.limit || 100);
  }

  private removeDuplicates(jobs: JobListing[]): JobListing[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = `${job.title}-${job.company}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async searchBySource(
    source: 'linkedin' | 'indeed' | 'adzuna' | 'gupy',
    params: JobSearchParams
  ): Promise<JobListing[]> {
    switch (source) {
      case 'linkedin':
        return this.linkedIn?.searchJobs(params) || [];
      case 'indeed':
        return this.indeed?.searchJobs(params) || [];
      case 'adzuna':
        return this.adzuna?.searchJobs(params) || [];
      case 'gupy':
        return this.gupy.searchJobs(params);
      default:
        return [];
    }
  }
}

// Exportar instância singleton
let aggregator: JobAggregator | null = null;

export function getJobAggregator(): JobAggregator {
  if (!aggregator) {
    aggregator = new JobAggregator({
      rapidApiKey: process.env.RAPIDAPI_KEY,
      adzunaAppId: process.env.ADZUNA_APP_ID,
      adzunaAppKey: process.env.ADZUNA_APP_KEY,
    });
  }
  return aggregator;
}
