import { webview } from '@kit.ArkWeb';
import { picker } from '@kit.CoreFileKit';
import { hilog } from '@kit.PerformanceAnalysisKit';

const DOMAIN = 0x0000;
const TAG = 'kids-jigsaw';

@Entry
@Component
struct Index {
  private controller: webview.WebviewController = new webview.WebviewController();

  build() {
    Column() {
      Web({ src: $rawfile('www/index.html'), controller: this.controller })
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .fileAccess(true)
        .zoomAccess(false)
        .metaViewport(true)
        .backgroundColor('#8ED8F8')
        .onShowFileSelector((event) => {
          // 自定义上传：系统相册选图回传给 Web 的 input[file]
          if (!event) {
            return false;
          }
          const photoPicker = new picker.PhotoViewPicker();
          photoPicker.select({
            MIMEType: picker.PhotoViewMIMETypes.IMAGE_TYPE,
            maxSelectNumber: 1
          }).then((res) => {
            event.handleFileList(res.photoUris);
          }).catch(() => {
            event.handleFileList([]);
          });
          return true;
        })
        .onConsole((msg) => {
          if (msg) {
            hilog.info(DOMAIN, TAG, 'web console: %{public}s', msg.getMessage().getMessage());
          }
          return false;
        })
        .width('100%')
        .height('100%')
    }
    .width('100%')
    .height('100%')
  }
}
