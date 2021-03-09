## 安装依赖包
axios 请求API，发送HTTP请求
concurrently 同时执行脚本指令
lodash 常用的第三方工具库
node_sass 引入SCSS支持

redux 状态管理工具
redux-thunk 数据异步处理库
reselect 抽取redux中的中间state，方便访问
nock Http服务器模拟
redux-mock-store 一个模拟store的redux异步库

以下是typescritp 类型定义
@types/lodash
@types/react-redux

## 引入redux支持

需要安装 `redux,react-redux,redux-thunk`

```ts
import { Provider } from "react-redux";

添加到渲染函数中
<Provider store={store}>
</Provider>
```

引入redux函数和异步库
`import { combineReducers, createStore, applyMiddleware } from 'redux';`

引入客户端定义的reducer,例如：
```ts
import currentReducer from './reducers/current.reducer';
import forecastReducer from './reducers/forecast.reducer';
```

合并reducer，并暴露给外界使用
```ts
const reducers = combineReducers({
    current: currentReducer,
    forecast: forecastReducer
});
export default createStore(
    reducers,
    applyMiddleware(thunk) // 中间件
);
```

## TypeScript 类型定义
参考目录：`common/interfaces/XXX`
比如： `IError, IWeather, ICurrentWeather`
类型可以嵌套定义，比如`ICurrentWeather` 引入 `IWeather`

```ts
export default interface IError {
    code: number;
    message: string;
}
```

常见的action类型定义：
```ts
export interface IGetCurrentWeatherSuccessAction {
    type: typeof GET_CURRENT_WEATHER_SUCCESS;
    payload: ICurrentWeather;
}

export const getCurrentWeatherSuccess = (current: ICurrentWeather): IGetCurrentWeatherSuccessAction => ({
    type: GET_CURRENT_WEATHER_SUCCESS,
    payload: current
});
```

多个类型合并定义：
`export type CurrentWeatherActionTypes = IGetCurrentWeatherAction | IGetCurrentWeatherSuccessAction | IGetCurrentWeatherFailureAction;`

state类型定义，action常伴随：发出请求，请求成功，请求失败
```ts
export const GET_CURRENT_WEATHER = 'GET_CURRENT_WEATHER';
export const GET_CURRENT_WEATHER_SUCCESS = 'GET_CURRENT_WEATHER_SUCCESS';
export const GET_CURRENT_WEATHER_FAILURE = 'GET_CURRENT_WEATHER_FAILURE';

export interface ICurrentState {
    loading: boolean;
    data: ICurrentWeather | null; // 合并可能类型
    error: IError | null;
}
```

数组定义
```ts
export interface IForecastState {
    loading: boolean;
    data: IForecast[];
    error: IError | null;
}
```

定义store数据类型
```ts
export interface IStore {
    current: ICurrentState
    forecast: IForecastState
}
```

引入redux-thunk中dispatch类型定义
```ts
import { ThunkDispatch } from "redux-thunk";

// dispatch 类型定义
return (dispatch: ThunkDispatch<IStore, {}, CurrentWeatherActionTypes>)

```

异步处理常见的写法
```ts
// 更新redux中状态数据
dispatch(getCurrentWeather());

// 发出请求
return WeatherbitApp.get<IGetCurrentWeatherResponse>('/current', {
    params: {
        city
    }
}).then(
    res => {
        const { data } = res;
        const { data: weatherList } = data

        if(weatherList && weatherList.length > 0 ) {
            // 状态数据更新成功
            dispatch(getCurrentWeatherSuccess(weatherList[0]))
        } else {
            // 状态数据更新失败
            dispatch(getCurrentWeatherFailure({
                code: 404,
                message: "Weather data not found"
            }))
        }
    },
    error => {
        // 状态更新失败
        dispatch(getCurrentWeatherFailure({
            code: error.response.status,
            message: error.message
        }))
    }
)
```

数据api接口放在constants.ts中
数据API_KEY 放置在env变量中

## Axios在ts中使用
```ts
import axios, { AxiosRequestConfig } from 'axios';

// api请求
const WeatherbitApp = axios.create();

const initRequestHeader = (config: AxiosRequestConfig) => {
  // 数据发出前拦截器：定义前缀URL，和携带key参数
  config.baseURL = WHEATHER_BASE_URL;
  config.params.key = process.env.REACT_APP_API_KEY;
  return config;
};

WeatherbitApp.interceptors.request.use(initRequestHeader);

export default WeatherbitApp;

```

## UI界面
文件结构样式
```
index.tsx
ui.tsx
ui.scss
```

把函数作为props传递给UI界面
```ts
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

const mapDispatchToProps = (dispatch: ThunkDispatch<IStore, {}, AnyAction>) => {
    return {
        fetchCurrent: (city:string) => dispatch(fetchCurrentWeather(city)),
        fetchForecast: (city:string) => dispatch(fetchForecast(city))
    };
};
export default connect(null, mapDispatchToProps)(App);
```

定义界面中的数据类型
```ts
interface IProps {
  fetchCurrent: Function;
  fetchForecast: Function;
}

interface IState {
  searchCity: string;
}

// UI写法
class App extends React.Component<IProps, IState>{}
```

输入抖动处理
`import { debounce } from "lodash";`
```ts
debounce((serachText: string) => {
    const { fetchCurrent, fetchForecast } = this.props;
    let searchCity = serachText ? serachText : "Melbourne,AU";
    fetchCurrent(searchCity);
    fetchForecast(searchCity);
}, 1000);
```

初始进入界面，第一次请求数据：
```ts
public componentDidMount = () => {
  const { fetchCurrent, fetchForecast } = this.props;
  fetchCurrent("Melbourne,AU");
  fetchForecast("Melbourne,AU");
};
```

拆分页面：如何拆分component
拆分原则：
A -> B , C
尽量把文件结构组织的易于阅读
```
src/
├── A/ 入口文件
├── B/ A拆分的组件文件
├── C/ A拆分的组件文件
│ ├── C1 子组件
│ ├── C2 子组件
└── D/
```

createSelector 的使用方法
```ts
import { createSelector } from 'reselect';

const getCurrentSelector = createSelector(
    (state: IStore) => state.current,
    (current: ICurrentState) => current,
);
```


## 关于CSS
min-height
text-align
background-image: url()
background-size
background
box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);

左上，右上圆角：
```css
border-top-left-radius: 32px;
border-top-right-radius: 32px;
```

返回数组的部分拷贝
data.slice(1,6)

## 配置eslint和prettier

用来检查语法错误
添加到package.json：
`"lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",`

安装以下依赖库
```
"@typescript-eslint/eslint-plugin": "^4.6.1",
"@typescript-eslint/parser": "^4.6.1",
"eslint": "^7.12.1",
"eslint-config-prettier": "7.0.0",
"eslint-plugin-prettier": "^3.1.4",
```

配置eslintrc.js文件
```
module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
  },
  plugins: [],
  extends: [
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
};
```

配置prettier 用来格式化代码
添加到package.json
`"format": "prettier --write \"src/**/*.ts\"",`

安装依赖文件
```
"eslint-config-prettier": "^8.1.0",
"eslint-plugin-prettier": "^3.3.1",
"prettier": "^2.2.1",
```

## 测试
`import { render, RenderResult } from "@testing-library/react";`

测试普通的ui组件
```ts
  let renderResult: RenderResult;

  const props = {
    title: "HUMIDITY",
    value: 12,
  };

  beforeEach(() => {
    renderResult = render(<Meta {...props} />);
  });

  it("should render day", () => {
    const { getByText } = renderResult;

    expect(getByText(props.title)).toBeInTheDocument();
    expect(getByText(props.value)).toBeInTheDocument();
  });
```

测试action的用例
```ts
describe("current action", () => {
  it("should create an action to get current weather", () => {
    expect(getCurrentWeather()).toEqual({
      type: GET_CURRENT_WEATHER,
    });
  });

  it("should create a failure action", () => {
    const error = { code: 404, message: "not found" };
    expect(getCurrentWeatherFailure(error)).toEqual({
      type: GET_CURRENT_WEATHER_FAILURE,
      payload: error,
    });
  });
});
```

测试reducer和异步处理函数
```ts
  it("should handle get current weather", () => {
  const action = {
    type: GET_CURRENT_WEATHER,
  };
  expect(
    currentReducer(initalState, action as IGetCurrentWeatherAction)
  ).toEqual({
    loading: true,
    data: null,
    error: null,
  });
});
```

测试异步处理函数
```ts
it("creates GET_CURRENT_WEATHER when fetching current weather", () => {
    nock(WHEATHER_BASE_URL)
      .get(`/current?city=melbourne&&key=${process.env.REACT_APP_API_KEY}`)
      .reply(200, { data: [expectData], count: 1 });

    const store = mockStore({ current: {} });

    const thunkDispatch = store.dispatch as ThunkDispatch<
      IStore,
      unknown,
      CurrentWeatherActionTypes
    >;

    return thunkDispatch(fetchCurrentWeather("melbourne")).then(() => {
      expect(store.getActions()).toEqual([
        getCurrentWeather(),
        getCurrentWeatherSuccess(expectData),
      ]);
    });
  });
```