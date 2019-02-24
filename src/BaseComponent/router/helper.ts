export interface IContext<IStoresModel> {
  stores: IStoresModel;
  [propName: string]: any;
}
