/* a sketch to extract data from a heightmap to a json file

The MIT License (MIT)

Copyright (c) 2014 Lucien Boudy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

float quality = 0.5; /* ------------- à paramétrer entre 0 et 1 ------------- */
int maxHeight = 20; /* ------------- à paramétrer entre 1 et 1000 ------------- */

JSONObject json;
JSONArray px_columns;

void setup ()
{
  json = new JSONObject();
  px_columns = new JSONArray();
  selectInput("Select a file to process : ", "fileSelected");
}

void fileSelected (File selection)
{ 
  if (selection == null) background(255, 0, 0);
  else
  {
    String map_url = selection.getAbsolutePath();
    PImage map_picture = loadImage(map_url);
    if (map_picture == null) background(255, 0, 0);
    else
    {
      size(map_picture.width, map_picture.height);
      image(map_picture, 0, 0);
      loadPixels();
      
      for (int i = int(map_picture.width * quality); i-->0;)
      {
        JSONArray px_rows = new JSONArray();
        for (int j = int(map_picture.height * quality); j-->0;)
        {
          int pos = int((i + j * map_picture.width) / quality);
          float r = red(pixels[pos]) / 255.0;
          float g = green(pixels[pos]) / 255.0;
          float b = blue(pixels[pos]) / 255.0;
          float gradient = r * 0.3 + g * 0.59 + b * 0.11;
          px_rows.setFloat(j, gradient * maxHeight);
        }
        px_columns.setJSONArray(i, px_rows);
      }
      json.setJSONArray("map", px_columns);
      saveJSONObject(json, "data/map.json");
      exit();
    }
  }
}

