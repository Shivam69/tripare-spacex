import { Launch, Launchpad } from '../types/spacex';

const BASE_URL = 'https://api.spacexdata.com';

export class SpaceXApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'SpaceXApiError';
  }
}

export class SpaceXApi {
  private static async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new SpaceXApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof SpaceXApiError) {
        throw error;
      }
      throw new SpaceXApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  static async getLaunches(options?: {
    limit?: number;
    offset?: number;
    sort?: 'desc' | 'asc';
  }): Promise<Launch[]> {
    const { limit = 50, offset = 0, sort = 'desc' } = options || {};
    
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      sort: `date_utc:${sort}`,
    });

    const url = `${BASE_URL}/v5/launches?${queryParams}`;
    return this.fetchWithErrorHandling<Launch[]>(url);
  }

  static async getLaunch(id: string): Promise<Launch> {
    const url = `${BASE_URL}/v5/launches/${id}`;
    return this.fetchWithErrorHandling<Launch>(url);
  }

  static async getLaunchpad(id: string): Promise<Launchpad> {
    const url = `${BASE_URL}/v4/launchpads/${id}`;
    return this.fetchWithErrorHandling<Launchpad>(url);
  }

  static async searchLaunches(query: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<Launch[]> {
    const { limit = 50, offset = 0 } = options || {};
    
    const body = {
      query: {
        name: {
          $regex: query,
          $options: 'i', // case insensitive
        },
      },
      options: {
        limit,
        offset,
        sort: {
          date_utc: -1, // desc
        },
      },
    };

    try {
      const response = await fetch(`${BASE_URL}/v5/launches/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new SpaceXApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data.docs || [];
    } catch (error) {
      if (error instanceof SpaceXApiError) {
        throw error;
      }
      throw new SpaceXApiError(
        `Search error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}