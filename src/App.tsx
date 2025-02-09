import { ConfigProvider } from "antd";

import InteractiveAvatar from "./components/InteractiveAvatar";
import { antDesignThemeConfig } from "./theme/antdesign-theme";

function App() {
  return (
    <ConfigProvider theme={antDesignThemeConfig} >
      <div className="w-screen bg-black h-screen flex flex-col">
        <div className="w-[900px] flex flex-col items-start justify-start gap-5 mx-auto pt-4 pb-20">
          <div className="w-full mt-10">
            <InteractiveAvatar />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
