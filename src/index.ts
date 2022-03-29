// const _ = require('lodash/core');
var _ = require('lodash');

type TUTMData = {
  UTMSource: string,
  UTMParams: string[]
}

type TUTMStore = Record<string, string>;

(function () {
  // Настройки
  const utmStoreName = 'utm-history';
  const emptyStore = {};

  let store: TUTMStore = {};

  // Получает данные стора
  function readStore() {
    // Получаем из localStorage сохраненные метки
    const utmStore = localStorage.getItem(utmStoreName);

    if (!utmStore) {
      localStorage.setItem(utmStoreName, JSON.stringify(emptyStore));
      store = emptyStore;
    } else {
      store = JSON.parse(utmStore);
    }
  }

  // Получает утм параметры из строки запроса
  function parseUTM(): TUTMData | null {
    // console.log(document.location.search);
    const queryString = document.location.search;

    // ?utm_source=yandex&utm_medium=cpm&utm_...
    const UTMSourceRE = /utm_source=[a-zA-Z_0-9]+/gim;
    const UTMParamsRE = /utm_[a-zA-Z_]+=[a-zA-Z_0-9]+/gim;
    const UTMSource = queryString.match(UTMSourceRE)![0].split('=')[1];
    const UTMParams = queryString.match(UTMParamsRE)!.splice(1);

    // console.log(UTMSource);
    // console.log(UTMParams);

    if (UTMSource) {
      console.log('Получены утм метки');
      return {
        UTMSource,
        UTMParams,
      };
    }

    console.log('Утм меток нет');
    return null
  }

  function mergeCustomizer(objValue: any, srcValue: any) {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }

  // Создает новую запись
  function createRecord(data: TUTMData) {
    const { UTMSource, UTMParams } = data;
    const date = Date.now();

    const values = UTMParams.reduce((acc: Record<string, any>, param: string) => {
      const [key, value] = param.split('=');
      acc[key] = {
        [value]: {
          dates: [date],
        }
      };
      return acc;
    }, {})

    const record = {
      'utm_source': {
        [UTMSource]: values
      }
    }

    return record;
  }

  // Вносит данные в стор
  function writeStore(data: Record<string, any>) {
    // Сливаем существующий стор с полученным объектом
    _.mergeWith(  store, data, mergeCustomizer)
    localStorage.setItem(utmStoreName, JSON.stringify(store))
  }

  function onDocumentLoad() {
    readStore();
    const UTMData = parseUTM();
    if (UTMData) {
      const newData = createRecord(UTMData);
      writeStore(newData);
    }

    console.log(store);
  }

  // Если пришли утм метки, складываем их в хранилище
  document.addEventListener('DOMContentLoaded', onDocumentLoad);
})();
