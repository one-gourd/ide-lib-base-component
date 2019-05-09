import Chance from 'chance';
import { JSONModel, IJSONModel, createJSONInstance } from '../../src';

const chance = new Chance();

describe('[createJSONInstance] 方便生成 json model ', () => {
  const jsonObj = {
    a: chance.integer(),
    b: chance.string()
  };
  test('支持对象和字符串入参', () => {
    const m1 = createJSONInstance(jsonObj);
    const m2 = createJSONInstance(JSON.stringify(jsonObj));

    expect(m1.value).toEqual(m2.value);
  });
});

describe('[JSONModel] json model', () => {
  let jsonModel: IJSONModel;
  const jsonObj = {
    a: chance.integer(),
    b: chance.string()
  };
  beforeEach(() => {
    jsonModel = createJSONInstance(jsonObj);
  });

  test('空 json 情况', () => {
    jsonModel = JSONModel.create({});
    expect(jsonModel.value).toEqual({});

    jsonModel = JSONModel.create({
      _value: JSON.stringify({})
    });
    expect(jsonModel.value).toEqual({});
  });

  test('通过 value 属性获取 json 内容', () => {
    expect(jsonModel.value).toEqual(jsonObj);
  });

  test('setValue 设置 json 内容', () => {
    const newObj = {
      c: 1,
      d: 'hello'
    };
    jsonModel.setValue(newObj);
    expect(jsonModel.value).toEqual(newObj);
  });

  test('支持获取 json 内部数据', () => {
    const newObj = {
      c: 1,
      d: 'hello'
    };
    jsonModel.setValue(newObj);
    expect(jsonModel.value).toEqual(newObj);

    expect(jsonModel.value.c).toEqual(newObj.c);
    expect(jsonModel.value.d).toEqual(newObj.d);
  });

  test('不支持局部修改 json 内部数据', () => {
    const newObj = {
      c: 1,
      d: 'hello'
    };
    jsonModel.setValue(newObj);

    jsonModel.value.c = 2;
    expect(jsonModel.value.c).toEqual(1); // 仍旧还是 1

    // 只能整体替换
    newObj.c = 2;
    jsonModel.setValue(newObj);
    expect(jsonModel.value.c).toEqual(2); // 整体替换才有效
  });
});
