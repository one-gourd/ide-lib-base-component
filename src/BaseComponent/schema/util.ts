import { invariant, capitalize } from 'ide-lib-utils';
import { debugModel } from '../../lib/debug';
import { JSONModel, IJSONModel } from './index';

/* ----------------------------------------------------
    更新 item 中指定 enum 的属性
----------------------------------------------------- */
export const updateInScope = (valueSet: string[]) => (
  item: any,
  attrName: string,
  value: any
): boolean => {
  invariant(!!item, '入参 item 必须存在');
  // 如果不是可更新的属性，那么将返回 false
  if (!valueSet.includes(attrName)) {
    debugModel(
      `[更新属性] 属性名 ${attrName} 不属于可更新范围，无法更新成 ${value} 值；（附:可更新属性列表：${valueSet}）`
    );
    return false;
  }

  const functionName = `set${capitalize(attrName)}`; // 比如 attrName 是 `type`, 则调用 `setType` 方法
  item[functionName](value);
  return true;
};

// 定义 menu 可更新信息的属性
// const EDITABLE_ATTRIBUTE = [
//   'visible',
//   'text',
//   'theme',
//   'styles'
// ];

// export const updateModelAttribute = updateInScope(EDITABLE_ATTRIBUTE);

/* ----------------------------------------------------
  初始化 JSON Model 
----------------------------------------------------- */
export function createJSONInstance(obj: string | object): IJSONModel {
  const model = JSONModel.create({});
  model.setValue(obj);
  return model;
}
