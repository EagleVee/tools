const fs = require("fs");
const lodash = require("lodash");

const componentContent = fileName => {
  return `import React, { useState } from "react";
import { View, Text } from "react-native";
import { compose } from "ramda";
import { ${fileName}Style } from "./${fileName}Style";
import PropTypes from "prop-types";

function ${fileName}(props) {
  const { styles } = props;
  return (
    <View style={styles.container}>
      <Text>${fileName}</Text>
    </View>
  );
}

${fileName}.propTypes = {
  onPress: PropTypes.func.isRequired
};

${fileName}.defaultProps = {
  onPress: () => {}
};

export default compose(${fileName}Style)(${fileName})`;
};

const componentReduxContent = fileName => {
  return `import React, { useState } from "react";
import { View, Text } from "react-native";
import { useNavigationMethods } from "Hooks/useNavigationMethods";
import { compose } from "ramda";
import { ${fileName}Style } from "./${fileName}Style";
import PropTypes from "prop-types";

function ${fileName}(props) {
  const { styles } = props;
  const NavigationMethods = useNavigationMethods();
  return (
    <View style={styles.container}>
      <Text>${fileName}</Text>
    </View>
  );
}

${fileName}.propTypes = {
  navigation: PropTypes.any
};

${fileName}.defaultProps = {};

export default compose(${fileName}Style)(${fileName})`;
};
const styleWrapperContent = fileName => {
  return `import React from "react";
import { StyleSheet } from "react-native";
import { WIDTH_RATIO } from 'Themes/Metrics';

import { useTheme } from 'Hooks/useTheme';

export const ${fileName}Style = OriginalComponent => props => {
 const { ApplicationStyles, Colors } = useTheme();
  const styles = StyleSheet.create({
    ${fileName.includes("Screen") ? "...ApplicationStyles.screen," : ""}
    ...ApplicationStyles.utils,
    ...ApplicationStyles.text,
  });

  return (
    <OriginalComponent
      {...props}
      styles={styles}
    />
  );
}`;
};

const containerContent = fileName => {
  return `import React, { useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { compose } from "ramda";
import { useNavigationMethods } from "Hooks/useNavigationMethods";
import { useTheme } from "Hooks/useTheme";
import { ${fileName}Style } from "./${fileName}Style";
import Container from "Components/Container/Container";
import { RNScrollView } from "Components/RNComponents";

function ${fileName}(props) {
  const { styles, navigation, route } = props;
  const NavigationMethods = useNavigationMethods();
  const { Colors } = useTheme();

  return (
    <Container>
      <RNScrollView>
        <Text>${fileName}</Text>
      </RNScrollView>
    </Container>
  );
}

export default compose(${fileName}Style)(${fileName})`;
};

const HOCContent = fileName => {
  return `import React from "react";
import { useDispatch, useSelector } from "react-redux";

export const ${fileName} = (OriginalComponent) => (props) => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  return <OriginalComponent {...props} />;
};`;
};

const actionContent = (fileName, normalizedFileName) => {
  return `import { createActions } from "reduxsauce";

const { Types, Creators } = createActions({
  get${fileName}s: ["params", "onSuccess", "onFailed"],
  get${fileName}sSuccess: ["response"],
  get${fileName}Detail: ["${normalizedFileName}Id", "onSuccess", "onFailed"],
  get${fileName}DetailSuccess: ["${normalizedFileName}Id", "response"]
});

export const ${fileName}Types = Types;

export default Creators;
`;
};

const reducerContent = (fileName, normalizedFileName) => {
  const uppercaseFileName = lodash.snakeCase(fileName).toUpperCase();
  return `import Immutable from "seamless-immutable";
import { createReducer } from "reduxsauce";
import { ${fileName}Types } from "Redux/Actions/${fileName}Actions";
import { AuthTypes } from "Redux/Actions/AuthActions";

export const INITIAL_STATE = Immutable({
  ${normalizedFileName}s: [],
});

export const get${fileName}sSuccess = (state, action) => {
  return state.merge({
    ${normalizedFileName}s: action.response.data
  });
}

export const onLogoutSuccess = (state, action) => {
  return INITIAL_STATE;
};

export const reducer = createReducer(INITIAL_STATE, {
  [${fileName}Types.GET_${uppercaseFileName}S_SUCCESS]: get${fileName}sSuccess,
  [AuthTypes.LOGOUT_TOKEN_SUCCESS]: onLogoutSuccess,
});`;
};

const sagaContent = (fileName, normalizedFileName) => {
  return `import API from "Services/API";
import { call, put } from "redux-saga/effects";
import ${fileName}Actions from "Redux/Actions/${fileName}Actions";

export function* get${fileName}s(action) {
  const { params, onSuccess = () => {}, onFailed = () => {} } = action;
}

export function* get${fileName}Detail(action) {
  const { ${normalizedFileName}Id, onSuccess = () => {}, onFailed = () => {} } = action;
}
`;
};
const mapSagaContent = (fileName, normalizedFileName) => {
  const uppercaseFileName = lodash.snakeCase(fileName).toUpperCase();
  return `import { takeLatest } from "redux-saga/effects";
import { ${fileName}Types } from "Redux/Actions/${fileName}Actions";
import { get${fileName}s, get${fileName}Detail } from "Sagas/${fileName}Sagas";

const map${fileName}Sagas = [
  takeLatest(${fileName}Types.GET_${uppercaseFileName}S, get${fileName}s),
  takeLatest(${fileName}Types.GET_${uppercaseFileName}_DETAIL, get${fileName}Detail),
];

export default map${fileName}Sagas;
`;
};

const transformContent = fileName => {
  return `import BaseTransform from "./BaseTransform";
export default class ${fileName} extends BaseTransform {
  fields = {};
  constructor(params = {}) {
    super(params);
    this.appendFields(params);
  }
}`;
};

const createComponent = (fileName, dirType, dirName) => {
  const content = componentContent(fileName);
  const styleContent = styleWrapperContent(fileName);
  let dirPath = `App/Components/${fileName}`;
  if (dirType) {
    if (dirType === "container") {
      dirPath = `App/Containers/${dirName}/${fileName}`;
    } else {
      dirPath = `App/Components/${dirName}`;
    }
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const filePath = dirPath + `/${fileName}.js`;
  const styleFilePath = dirPath + `/${fileName}Style.js`;
  if (fs.existsSync(filePath) || fs.existsSync(styleFilePath)) {
    throw new Error("File existed!");
  } else {
    writeToOutput(filePath, content);
    writeToOutput(styleFilePath, styleContent);
  }
};

const createComponentRedux = (fileName, dirType, dirName) => {
  const content = componentReduxContent(fileName);
  const styleContent = styleWrapperContent(fileName);
  let dirPath = `App/Components/${fileName}`;
  if (dirType) {
    if (dirType === "container") {
      dirPath = `App/Containers/${dirName}/${fileName}`;
    } else {
      dirPath = `App/Components/${dirName}`;
    }
  }
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  const filePath = dirPath + `/${fileName}.js`;
  const styleFilePath = dirPath + `/${fileName}Style.js`;
  if (fs.existsSync(filePath) || fs.existsSync(styleFilePath)) {
    throw new Error("File existed!");
  } else {
    writeToOutput(filePath, content);
    writeToOutput(styleFilePath, styleContent);
  }
};

const createContainer = fileName => {
  const content = containerContent(fileName);
  const styleContent = styleWrapperContent(fileName);
  const dirPath = `App/Containers/${fileName}`;
  const filePath = `App/Containers/${fileName}/${fileName}.js`;
  const styleFilePath = `App/Containers/${fileName}/${fileName}Style.js`;
  if (fs.existsSync(dirPath)) {
    throw new Error("Directory existed!");
  } else {
    fs.mkdirSync(dirPath);
  }
  if (fs.existsSync(filePath) || fs.existsSync(styleFilePath)) {
    throw new Error("File existed!");
  } else {
    writeToOutput(filePath, content);
    writeToOutput(styleFilePath, styleContent);
  }
};

const createHOC = fileName => {
  const content = HOCContent(fileName);
  const filePath = `App/Business/${fileName}.js`;
  if (fs.existsSync(filePath)) {
    throw new Error("File existed!");
  } else {
    writeToOutput(filePath, content);
  }
};

const createRedux = fileName => {
  const normalizedFileName = fileName.replace(
    fileName[0],
    fileName[0].toLowerCase(),
  );
  const action = actionContent(fileName, normalizedFileName);
  const reducer = reducerContent(fileName, normalizedFileName);
  const saga = sagaContent(fileName, normalizedFileName);
  const mapSaga = mapSagaContent(fileName, normalizedFileName);

  const actionPath = `App/Redux/Actions/${fileName}Actions.js`;
  const reducerPath = `App/Redux/Reducers/${fileName}Reducer.js`;
  const sagaPath = `App/Sagas/${fileName}Sagas.js`;
  const mapSagaPath = `App/Sagas/MapSagas/map${fileName}Sagas.js`;

  if (
    fs.existsSync(actionPath) ||
    fs.existsSync(reducerPath) ||
    fs.existsSync(sagaPath) ||
    fs.existsSync(mapSagaPath)
  ) {
    throw new Error("File existed!");
  } else {
    writeToOutput(actionPath, action);
    writeToOutput(reducerPath, reducer);
    writeToOutput(sagaPath, saga);
    writeToOutput(mapSagaPath, mapSaga);
  }
};

const createTransform = fileName => {
  const transform = transformContent(fileName);
  const transformPath = `App/Transforms/${fileName}.js`;

  if (fs.existsSync(transformPath)) {
    throw new Error("File existed!");
  } else {
    writeToOutput(transformPath, transform);
  }
};

function writeToOutput(fileOutput, content) {
  const outputWriteStream = fs.createWriteStream(fileOutput);
  outputWriteStream.write(content);
}

const createFile = () => {
  const args = process.argv.slice(2);
  const type = args[0];
  const name = args[1];
  const dirType = args[2];
  const dirName = args[3];
  if (type && name) {
    switch (type) {
      case "component":
        createComponent(name, dirType, dirName);
        break;
      case "component-redux":
        createComponentRedux(name, dirType, dirName);
        break;
      case "container":
        createContainer(name);
        break;
      case "hoc":
        createHOC(name);
        break;
      case "redux":
        // Chỉ tạo bằng tên Redux, ví dụ AuthActions thì chỉ yarn generate redux Auth
        createRedux(name);
        break;
      case "transform":
        createTransform(name);
        break;
    }
  } else {
    throw new Error("Missing type or file name");
  }
};

createFile();
