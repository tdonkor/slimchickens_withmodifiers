import { Injectable } from '@angular/core';
import {
  DotTreeLoader,
  DotTree,
  DotPage,
  FilesLoaderService,
  DotButton,
  AppInitStep,
  DotCatalogLoader,
  DotManifest,
  DotManifestLoader,
  DotBanner,
  DotBannersLoader,
  getInnerPages,
  getPage,
} from 'dotsdk';
import * as lodash from 'lodash';
import { omitPropertiesInObject, DotWorkingHoursList, DotWorkingHoursLoader } from 'dotsdk';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  protected _dotTree: DotTree;
  protected _buttons: DotButton[];
  protected _pages: DotPage[];
  protected _hiddenPages: DotPage[];
  protected _manifest: DotManifest;
  protected _banners: DotBanner[];
  protected _workingHours: DotWorkingHoursList;
  protected _loadingProgress: Subject<AppInitStep> = new Subject();
  public get loadingProgress() {
    return this._loadingProgress.asObservable();
  }

  constructor() {}

  /**
   * This function will get called in App Initialize phase, so the content will be ready when the App gets rendered
   *
   * @param acreBridgeAssets path to 'shared\assets' folder (where DOTXIX-DataDeliveryService will copy .json files)
   */
  public async initialize(acreBridgeAssets: string) {
    // FilesLoaderService will register proper loaders ALL default .json files.
    // FilesLoaderService.getInstance().registerDefaultLoaders(acreBridgeAssets);

    // FilesLoaderService.getInstance().loadingProgress.subscribe((x) => this._loadingProgress.next(x as AppInitStep));

    // The Actual Files Load call:
    // As FilesLoaderService uses Singleton Pattern, you may use your models anywhere in your App
    // await FilesLoaderService.getInstance().initialize();

    // Retrieve data from DotTreeLoader (loader for pages.json)
    this._dotTree = DotTreeLoader.getInstance().loadedModel;
    this._banners = DotBannersLoader.getInstance().loadedModel;

    this._buttons = this.getInnerButtons(this._dotTree.MainPage);
    this._pages = this.getInnerPages(this._dotTree.MainPage);
    this._hiddenPages = this._dotTree.HiddenPages;
    this._manifest = DotManifestLoader.getInstance().loadedModel;
    this._workingHours = DotWorkingHoursLoader.getInstance().loadedModel;
    this.cacheImages(
      this._buttons.map((x) => x.Picture),
      acreBridgeAssets
    );
  }

  public getDotTree(returnCopyOfOriginal: boolean = true): DotTree {
    return returnCopyOfOriginal ? lodash.cloneDeep(this._dotTree) : this._dotTree;
  }

  public getWorkingHoursList() {
    return this._workingHours ? lodash.cloneDeep(this._workingHours) : this._workingHours;
  }

  public getAllButtons(returnCopyOfOriginal: boolean = true): DotButton[] {
    return returnCopyOfOriginal ? lodash.cloneDeep(this._buttons) : this._buttons;
  }

  // todo: remove this, use DotManifestLoader.getInstance().loadedModel
  public getManifestFile() {
    return this._manifest;
  }
  public getBanners(returnCopyOfOriginal: boolean = false): DotBanner[] {
    return returnCopyOfOriginal ? lodash.cloneDeep(this._banners) : this._banners;
  }
  public getPages(returnCopyOfOriginal: boolean = true): DotPage[] {
    return returnCopyOfOriginal ? lodash.cloneDeep(this._pages) : this._pages;
  }

  public getHiddenPages(returnCopyOfOriginal: boolean = true): DotPage[] {
    return returnCopyOfOriginal ? lodash.cloneDeep(this._hiddenPages) : this._hiddenPages;
  }

  public getMainPage(returnCopyOfOriginal: boolean = false): DotPage {
    return returnCopyOfOriginal ? lodash.cloneDeep(this._dotTree.MainPage) : this._dotTree.MainPage;
  }
  /*
  @deprecated
  */
  public getLandingPage(returnCopyOfOriginal: boolean = true): DotPage {
    const allLandingPages = <DotButton[]>this._dotTree.MainPage.Buttons.filter((x: DotButton) => x.Page.IsLandingPage);
    const landingPage = allLandingPages && allLandingPages.length > 0 ? allLandingPages[0].Page : null;
    return landingPage && returnCopyOfOriginal ? lodash.cloneDeep(landingPage) : landingPage;
  }

  public getLandingPages(customDotTree: DotTree = this._dotTree): DotPage[] {
    return customDotTree.HiddenPages.filter((page) => page.PageType.toLowerCase() === 'landingpage');
  }

  public getPage(id: string, returnCopyOfOriginal: boolean = true): DotPage {
    return getPage(id, returnCopyOfOriginal);
  }

  public getHiddenPage(id: string, returnCopyOfOriginal: boolean = true): DotPage {
    const page = this._hiddenPages && this._hiddenPages.length > 0 ? this._hiddenPages.find((x) => x.ID === id) : null;
    return page && returnCopyOfOriginal ? lodash.cloneDeep(page) : page;
  }

  public getButton(link: string, returnCopyOfOriginal: boolean = true) {
    const button = this._buttons && this._buttons.length > 0 ? this._buttons.find((x) => x.Link === link) : null;
    return button && returnCopyOfOriginal ? lodash.cloneDeep(button) : button;
  }

  public getItem(buttonLink: string, returnCopyOfOriginal: boolean = false) {
    const items = DotCatalogLoader.getInstance().loadedModel.Buttons;
    const item = items.find((i) => i.Link === buttonLink);
    return item && returnCopyOfOriginal ? lodash.cloneDeep(item) : item;
  }

  // TODO: add lodash here!
  public areButtonsSimilar(button1: DotButton, button2: DotButton): boolean {
    // Make sure they have the same Link:
    if (button1.Link !== button2.Link) {
      return false;
    }

    // Compare Promos:
    const samePromo = button1['Promo'] === button2['Promo'];

    // Compare Modifiers
    const omitPropertiesModifiers = ['analyticsOptions', '$uuid', '$type', '$$prefixName', 'ref_uuid'];
    const sameModifiers =
      (!button1.hasModifiers && !button2.hasModifiers) ||
      lodash.isEqual(
        omitPropertiesInObject(button1.ModifiersPage, omitPropertiesModifiers),
        omitPropertiesInObject(button2.ModifiersPage, omitPropertiesModifiers)
      );

    const omitPropertiesCombos = omitPropertiesModifiers.concat(['StartSize', 'selectedSize']);
    const sameCombos =
      (!button1.hasCombos && !button2.hasCombos) ||
      lodash.isEqual(
        omitPropertiesInObject(button1.ComboPage, omitPropertiesCombos),
        omitPropertiesInObject(button2.ComboPage, omitPropertiesCombos)
      );
    return samePromo && sameModifiers && sameCombos;
  }

  protected getInnerButtons(page: DotPage): DotButton[] {
    const products: DotButton[] = [];
    page.Buttons.forEach((x: DotButton) => {
      if (x.Link) {
        products.push(x);
      }

      if (x.Page) {
        products.push(...this.getInnerButtons(x.Page));
      }
    });
    return products;
  }

  protected getInnerPages(page: DotPage): DotPage[] {
    return getInnerPages(page);
  }

  protected async cacheImages(images: string[], acreBridgeAssets: string): Promise<void> {
    const imageLoader = (path: string) => {
      return new Promise<boolean>((resolve) => {
        const image = new Image();

        image.onload = () => {
          resolve(true);
        };

        image.onerror = () => {
          // Log.debug('Could not load image: {0}', path);
          resolve(false);
        };

        image.src = path;
      });
    };

    const itemsPath = acreBridgeAssets + '/Items/';
   // const itemsPath = 'http://localhost:4200/assets/shared/assets/Items/';

    return Promise.runSerial(images.map((_) => () => imageLoader(itemsPath + _))).then((_: boolean[]) => {});
  }
}
