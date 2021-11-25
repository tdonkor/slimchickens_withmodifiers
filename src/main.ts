import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { DOTPlatform, IMockConfiguration, FilesLoaderService, AtpApplicationSettings, AtpEnvironmentService } from 'dotsdk';
import { appLogManager } from './log-manager';

if (environment.production) {
  enableProdMode();
}

const mockOptions: IMockConfiguration = {
  useMocksForEnvironment: environment.useMocksForEnvironment,
  environmentMocksPath: '/assets/dot-sdk-mocks/atp-environment/',
  useMocksForPay: environment.useMocksForPay,
  payMocksPath: '/assets/dot-sdk-mocks/atp-pay/',
  useMocksForPos: environment.useMocksForPos,
  posMocksPath: '/assets/dot-sdk-mocks/pos-injector/',
};

const logger = appLogManager.getLogger('slimchickens.app');

DOTPlatform(mockOptions).then(
  () => new Promise<void>((resolve, reject) => {
    // if (environment.production) {
    //   AtpEnvironmentService.getInstance().hideCloseButton().catch((x) => null);
    // }
    // const sharedFolderPath = `${AtpApplicationSettings.getInstance().bundleSettingsJson.sharedFolderPath}/assets`;
    // FilesLoaderService.getInstance().registerDefaultLoaders(sharedFolderPath);
    // resolve(FilesLoaderService.getInstance().initialize());
    resolve();
  })
).then((value) =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then((x) => logger.info(`application initialized`))
    .catch((err) => logger.error(`${err}`))
);
