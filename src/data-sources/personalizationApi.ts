// import DataLoader from 'dataloader';
import { RESTDataSource, AugmentedRequest } from "@apollo/datasource-rest";
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';

export class PersonalizationAPI extends RESTDataSource {
  override baseURL = "https://motomotagp-default-rtdb.europe-west1.firebasedatabase.app/";
  private token: string;

  constructor(options: { token?: string; cache: KeyValueCache }) {
    super(options);
    this.token = options.token;
  }

  override willSendRequest(_path: string, request: AugmentedRequest) {
    request.headers["authorization"] = this.token;
  }

  // override async resolveURL(path: string, request: AugmentedRequest) {
  //   if (!this.baseURL) {
  //     const addresses = await resolveSrv(path.split('/')[1] + '.service.consul');
  //     this.baseURL = addresses[0];
  //   }
  //   return super.resolveURL(path, request);
  // }

  // private progressLoader = new DataLoader(async (ids) => {
  //   const progressList = await this.get('progress', {
  //     params: { ids: ids.join(',') },
  //   });
  //   return ids.map((id) => progressList.find((progress) => progress.id === id));
  // });

  // async getProgressFor(id) {
  //   return this.progressLoader.load(id);
  // }
}
