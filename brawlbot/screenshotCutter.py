import numpy as np
from PIL import Image
from my_logging import my_print as print

borderColor = (11, 75, 190)
pixelsToChange = []

def getLeft(image, pix):
    """Returns the most left pixel which has the border color."""
    for x in range(0, image.size[0]-1):
        for y in range(0, image.size[1]):
            if colorsMatch(pix, x, y, borderColor):
                return x
def goRight(image, pix, left):
    """Returns the most right, top and bottom pixel which has the border color."""
    topMostBorder = image.size[1]
    bottomMostBorder = 0
    for x in range(left+1, image.size[0]):
        borderFound = False
        for y in range(0, image.size[1]):
            if colorsMatch(pix, x, y, borderColor):
                if borderFound and bottomMostBorder < y:
                    bottomMostBorder = y
                elif topMostBorder > y:
                    topMostBorder = y
                borderFound = True
        if not borderFound:
            break
    return x, topMostBorder, bottomMostBorder

def markEdge(left, right, top, bottom, pix):
    """Debug. Marks all pixels that are checked and surrounds the cutted Screenshot in yellow."""
    for x in range(left, right):
        pixelsToChange.append([x, top, 200, 200, 0])
    for y in range(top, bottom):
        pixelsToChange.append([right, y, 200, 200, 0])
    for x in range(right, left, -1):
        pixelsToChange.append([x, bottom, 200, 200, 0])
    for y in range(bottom, top, -1):
        pixelsToChange.append([left, y, 200, 200, 0])
    for c in pixelsToChange: #c[x, y, r, g, b]
        prevColor = pix[c[0], c[1]]
        prevColor = [prevColor[0], prevColor[1], prevColor[2]]
        for i in range(0, 3):
            prevColor[i] += c[i+2]
            if prevColor[i] > 255:
                prevColor[i] = 255
        pix[c[0], c[1]] = (prevColor[0], prevColor[1], prevColor[2])
def cut(path, savePath):
    """Cuts the brawlstars map screenshot so that only the map is visible. Returns the name of the cutted Screenshot File."""
    image = Image.open(path).convert('RGB')
    debugImage = image.copy()
    pix = image.load()
    left = getLeft(image, pix)
    right, top, bottom = goRight(image, pix, left)
    image = image.crop((left, top, right, bottom))
    image.save(savePath)

    markEdge(left, right, top, bottom, debugImage.load())
    idx = savePath.index('.')
    savePath = savePath[:idx] + '_debug' + savePath[idx:]
    debugImage.save(savePath)
    
    return savePath.split('/')[-1]
def colorsMatch(pix, x, y, color2, tolerance=5):
    """Checks if two colors are similar with a given tolerance."""
    color1 = pix[x, y]
    for i in range(0, 3):
        if not abs(color1[i] - color2[i]) <= tolerance:
            pixelsToChange.append([x, y, 50, 0, 0])
            return False
    pixelsToChange.append([x, y, 0, 50, 0])
    return True