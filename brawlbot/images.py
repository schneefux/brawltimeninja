import cv2
import numpy
from my_logging import my_print as print

def is_image_in_image(smallImage, largeImage):
    """Returns true if the smallImage is found in the largeImage using cv2. Images have to be of type cv2 image you can use the 'load_image_from_path' method"""
    if smallImage is None:
        print('small image is none')
        return False
    if largeImage is None:
        print('large image is none')
        return False
    method = cv2.TM_CCOEFF_NORMED
    result = cv2.matchTemplate(smallImage, largeImage, method)
    threshold = 0.8
    loc = numpy.where(result >= threshold)
    w, h = largeImage.shape[::-1]
    for pt in zip(*loc[::-1]):  # Switch collumns and rows
        cv2.rectangle(largeImage, pt, (pt[0] + w, pt[1] + h), (0, 0, 255), 2)
        print('\nimage found!')
        return True
def load_image_from_path(path):
    """Loads an image of type .png or .jpg from a given path and returns it in the cv2 format."""
    print('converting image path to cv2 image', path)
    image = cv2.imread(path, 0)
    return image