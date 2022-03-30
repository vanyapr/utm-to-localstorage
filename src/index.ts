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
    const queryString = document.location.search;

    // ?utm_source=yandex&utm_medium=cpm&utm_...
    if (queryString) {
      const UTMSourceRE = /utm_source=[a-zA-Z_0-9]+/gim;
      const UTMParamsRE = /utm_[a-zA-Z_]+=[a-zA-Z_0-9]+/gim;
      const UTMSource = queryString.match(UTMSourceRE)![0].split('=')[1];
      const UTMParams = queryString.match(UTMParamsRE)!.splice(1);

      if (UTMSource) {
        return {
          UTMSource,
          UTMParams,
        };
      }
    }

    return null;
  }

  function mergeObjects(lhs: any, rhs: any) {
    for (let key in rhs) {
      if (rhs[key].constructor === Object) {
        // Если объект
        if (lhs[key]) {
          lhs[key] = mergeObjects(lhs[key], rhs[key]);
        } else {
          lhs[key] = rhs[key];
        }
      } else if (rhs[key].constructor === Array) {
        // Если у нас массив
        lhs[key] = lhs[key].concat(rhs[key]);
      } else {
        // Если значение
        lhs[key] = rhs[key];
      }
    }

    return lhs;
  }

  // Создает новую запись
  function createRecord(data: TUTMData) {
    const {
      UTMSource,
      UTMParams
    } = data;

    const values = UTMParams.reduce((acc: Record<string, any>, param: string) => {
      const [key, value] = param.split('=');

      acc[key] = {
        [value]: {
          dates: [Date.now()
            .toString()],
        }
      };

      return acc;
    }, {});

    return {
      'utm_source': {
        [UTMSource]: values
      }
    };
  }

  // Вносит данные в стор
  function writeStore(data: Record<string, any>) {
    // Сливаем существующий стор с полученным объектом
    store = mergeObjects(store, data);
    localStorage.setItem(utmStoreName, JSON.stringify(store));
  }

  function onDocumentLoad() {
    readStore();
    const UTMData = parseUTM();
    if (UTMData) {
      const newData = createRecord(UTMData);
      writeStore(newData);
    }
  }

  // Если пришли утм метки, складываем их в хранилище
  document.addEventListener('DOMContentLoaded', onDocumentLoad);
})();
