import { IContext } from 'ette';
import { isPlainObject, getValueByPath } from "ide-lib-utils";

/**
 * 更新 styles 的 ette 中间件
 * @param stylesModelPath - stores 中 style model 的路径
 */
export const updateStylesMiddleware = (stylesModelPath: string) => (ctx: IContext) => {
  const { stores, request } = ctx;
  const { style } = request.data;
  const { target } = ctx.params;
  let result = {
    message: '',
    success: false
  };

  if (!target) {
    result.message = '传入 css 目标不能为空';
  } else if (!isPlainObject(style)) {
    result.message = `传入 css 对象格式不正确: ${style}`;
  } else {
    // stores.setSchema(createSchemaModel(schema));
    const targetModel = getValueByPath(stores, stylesModelPath);
    if (targetModel) {
      result = targetModel.updateCssAttribute(target, style);
    } else {
      result.message = `stores['${stylesModelPath}'] may has't mix style model, please check`;
    }
  }

  ctx.response.body = result;
  ctx.response.status = 200;
}

/**
 * 更新 theme 的 ette 中间件
 * @param themeModelPath - stores 中 theme model 的路径（一般和 style model 路径一致）
 */
export const updateThemeMiddleware = (themeModelPath: string) => (ctx: IContext) => {
  const { stores, request } = ctx;
  const { value } = request.data;
  const { target } = ctx.params;
  let result = {
    message: '',
    success: false
  };
  // stores.setSchema(createSchemaModel(schema));
  const targetModel = getValueByPath(stores, themeModelPath);
  if (targetModel) {
    result = targetModel.updateTheme(target, value);
  } else {
    result.message = `stores['${themeModelPath}'] may has't mix theme model, please check`;
  }
  ctx.response.body = result;
  ctx.response.status = 200;
}