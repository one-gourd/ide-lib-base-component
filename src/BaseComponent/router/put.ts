import { IContext } from 'ette';
import { isPlainObject, getValueByPath } from "ide-lib-utils";
import { buildNormalResponse} from './util';

/**
 * 更新 styles 的 ette 中间件
 * @param stylesModelPath - stores 中 style model 的路径
 */
export const updateStylesMiddleware = (stylesModelPath: string) => (ctx: IContext) => {
  const { stores, request } = ctx;
  const { style } = request.data;
  const { target } = ctx.params;

  let message = '';
  let success = false;
  let origin = {}
  if (!target) {
    message = '传入 css 目标不能为空';
  } else if (!isPlainObject(style)) {
    message = `传入 css 对象格式不正确: ${style}`;
  } else {
    // stores.setSchema(createSchemaModel(schema));
    const targetModel = getValueByPath(stores, stylesModelPath);
    if (targetModel) {
      origin = targetModel.styles;
      const result = targetModel.updateCssAttribute(target, style);
      message = result.message;
      success = result.success;
    } else {
      message = `stores['${stylesModelPath}'] may has't mix style model, please check`;
    }
  }

  buildNormalResponse(ctx, 200, { success, origin }, success ? `${target} 的 style 从 ${origin} -> ${style} 的变更: ${success}.` : message);
}

/**
 * 更新 theme 的 ette 中间件
 * @param themeModelPath - stores 中 theme model 的路径（一般和 style model 路径一致）
 */
export const updateThemeMiddleware = (themeModelPath: string) => (ctx: IContext) => {
  const { stores, request } = ctx;
  const { value } = request.data;
  const { target } = ctx.params;


  let message = '';
  let success = false;
  let origin = '';
  // stores.setSchema(createSchemaModel(schema));
  const targetModel = getValueByPath(stores, themeModelPath);
  if (targetModel) {
    origin = targetModel.themeValue(target);
    const result = targetModel.updateTheme(target, value);
    message = result.message;
    success = result.success;
  } else {
    message = `stores['${themeModelPath}'] may has't mix theme model, please check`;
  }

  buildNormalResponse(ctx, 200, { success, origin }, success ? `theme.[${target}] 从 ${origin} -> ${value} 的变更: ${success}.` : message);

}