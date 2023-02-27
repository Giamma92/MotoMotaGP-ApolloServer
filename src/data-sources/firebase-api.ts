import { RequestOptions, RESTDataSource } from '@apollo/datasource-rest';
import { RequestDeduplicationPolicy } from '@apollo/datasource-rest/dist/RESTDataSource';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import { DocumentMapper } from '../utils/document-mapper.js';
import { Document, Entity } from '../model-interfaces';

export class FirebaseAPI extends RESTDataSource {
  private projectId = "motomotagp";
  override baseURL = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/`  // 'https://motomotagp-default-rtdb.europe-west1.firebasedatabase.app/';
  private token: string;

  protected override requestDeduplicationPolicyFor(url: URL, request: RequestOptions): RequestDeduplicationPolicy {
    const cacheKey = this.cacheKeyFor(url, request);
    return { policy: 'do-not-deduplicate' } as const;
  }

  async getEntity(collection: string, id: string): Promise<Entity> {
    const data = await this.get(`${collection}/${encodeURIComponent(id)}`);
    const entity = DocumentMapper.toEntity(data);
    return entity;
  }

  constructor(options: { token?: string; cache: KeyValueCache }) {
    super(options); // this sends our server's `cache` through
    this.token = options.token;
  }  

  async getEntities(collection: string, limit: string = '10'): Promise<Entity[]> {
    const data = await this.get(`${collection}`, {
      params: {
        // orderBy: '"$key"',
        // limitToFirst: limit,
      },
    });
    //const dataArray: Document[] = Object.values(data);
    //console.log(data)
    const entities = DocumentMapper.toListEntity(data);
    return entities;
  }
}