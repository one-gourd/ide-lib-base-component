import Application, { Client } from 'ette';
import { capitalize } from 'ide-lib-utils';
import { cast, SnapshotOrInstance, IAnyModelType } from 'mobx-state-tree';
import { IStoresEnv } from '../../index';




/* ----------------------------------------------------
    以下是专门配合子组件 stores 提取的工具函数
----------------------------------------------------- */

export type TAnyMSTModel = SnapshotOrInstance<IAnyModelType>;

export function getSubStoresAssigner<T extends TAnyMSTModel>(stores: T, subAppNames: string[]) {

    const assigners: Record<string, (store: TAnyMSTModel) => any> = {};
    subAppNames.forEach((name: string) => {
        assigners[`set${capitalize(name)}`] = (subStoreInstance: TAnyMSTModel) => {
            stores[name] = cast(subStoreInstance);
        };
    });
    return assigners;
}


export function getSubAppsFromFactoryMap(factoryMap: Record<string, (...args: any[]) => Partial<IStoresEnv<TAnyMSTModel>>>) {
    const subApps: Record<string, Application> = {};
    const subClients: Record<string, Client> = {};
    const subStores: Record<string, TAnyMSTModel> = {};

    for (const appName in factoryMap) {
        if (factoryMap.hasOwnProperty(appName)) {
            const factory = factoryMap[appName];
            const {
                stores,
                app,
                client
            } = factory();

            subApps[appName] = app;
            subClients[appName] = client;
            subStores[appName] = stores;
        }
    }

    return { subStores, subApps, subClients }
}