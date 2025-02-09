import { ConfigProvider } from "antd";

import InteractiveAvatar from "./components/InteractiveAvatar";
import { antDesignThemeConfig } from "./theme/antdesign-theme";

function App() {
  return (
    <ConfigProvider theme={antDesignThemeConfig}>
      <div className="w-screen bg-black min-h-screen flex flex-col">
        <div className="w-full max-w-[900px] flex flex-col items-start justify-start gap-5 mx-auto  pb-20 px-4">
          <div className="w-full mt-10">
            <InteractiveAvatar />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
