/// <reference path="../core/plestecin.ts" />

module Plestecin {

    interface ImageArray {
        [index: string]: HTMLImageElement;
    }


    export class AssetRegistry implements GamePlugin {
        public images: ImageArray = {};
        private imageRequests = {};

        init(eventBus: GameEventBus, success: (gamePlugin: GamePlugin) => void, error: (gamePlugin: GamePlugin, cause: Error) => void) {
            this.loadImages(success, error);
        }

        loadImage(name, url) {
            this.imageRequests[name] = url;
        }

        private loadImages(success: (gamePlugin: GamePlugin) => void, error: (gamePlugin: GamePlugin, cause: Error) => void) {
            var imagesLoadedCnt = Object.keys(this.imageRequests).length;
            for(var name in this.imageRequests) {
                var image = new Image();
                image.src = this.imageRequests[name];
                image.onload = () => {
                    imagesLoadedCnt--;
                    if(imagesLoadedCnt === 0) {
                        success(this);
                    }
                };
                this.images[name] = image;
            }
        }

    }

}