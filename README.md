An extension to make browsing the API in Chrome less painful.

Installation
----

1. Clone the chrome extension (and its submodules):

    `git clone https://github.com/aidansteele/playup-chrome-ext.git`

    `git submodule update --init --recursive`

2.  Navigate to wherever you cloned to; open background.js in a text editor.

3.  On line 30:

    `localStorage["api-key"] = "<api key>";`

    replace `<api key>` with a suitable API key and authorisation ID/key from the relevant credentials server and save the edited file.

4. Open chrome and go to Settings.

5. Select Extensions on the left.

6. Click "Load unpackaged extension..." and select the directory you cloned to.

7. Once the extension is installed, use chrome to go to an end-point i.e.

    `http://api.playup.com/v2/clients/live-20131029`

8. If you see an error message refresh your browser and it should work.


*Note:* With staging URLs e.g.

`http://staging.api.playupdev.com/v2/clients/live-20131029`

Refreshing doesn't always work. In the error JSON you see in chrome there is a link. Click it and accept the certificate warning it prompts about. Then you can press back in the browser to get back to the staging endpoint again. This time hitting refresh should make it work.
