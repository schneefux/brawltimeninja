import os
import sys

def get_path_to_script():
    """Returns the absolute path to this script."""
    global pathToScript
    pathToScript = os.path.dirname(__file__) + '/'
    return pathToScript
def get_path_to_adb():
    """Returns the platform dependend path to the adb commands file."""
    global pathToAdb
    if isWin:
        pathToAdb = 'C:/Users/yourusername/AppData/Local/Android/Sdk/platform-tools/adb '
    else:
        pathToAdb = 'adb '
    return pathToAdb
def get_screenshot_filename():
    """Returns the default filename for the screenshots."""
    global screenshotFilename
    screenshotFilename = 'screenshot.png'
    return screenshotFilename
def get_is_win():
    """Returns true if the os is running Windows"""
    global isWin
    isWin = 'win' in sys.platform
    return isWin
def get_cutted_screenshot_filename():
    """Returns the default filename for the cutted screenshot."""
    global cuttedscreenshotFilename
    cuttedscreenshotFilename = 'cuttedScreenshot.png'
    return cuttedscreenshotFilename
def get_python_path():
    global pythonPath
    if isWin:
        pythonPath = 'python'
    else:
        pythonPath = '/usr/bin/python3'
    return pythonPath

print('initializing vars:')
print('isWin='+str(get_is_win()))
print('pathToScript='+get_path_to_script())
print('pathToAdb='+get_path_to_adb())
print('screenshotFilename='+get_screenshot_filename())
print('cuttedscreenshotFilename='+get_cutted_screenshot_filename())
print('pythonPath='+get_python_path())
