import subprocess
import vars
import time
import images
from my_logging import my_print as print

def run_adb_command(command):
    """runs an adb command."""
    return subprocess.Popen(vars.pathToAdb + command, shell=True, stdout=subprocess.PIPE)

def scroll(x1, y1, x2, y2):
    """Simulates a swipe on the phone from position x1, y1 to position x2, y2."""
    print('scrolling')
    run_adb_command('shell input swipe '+str(x1)+' '+str(y1)+' '+str(x2)+' '+str(y2))
def tap(x, y):
    """Simualtes a tap on the display at the position x, y"""
    print('tapping')
    run_adb_command('shell input tap '+str(x)+' '+str(y))
def get_screenshot():
    """Saves the screenshot from the phone as screenshot.png"""
    print('taking screenshot')
    process = run_adb_command('shell screencap -p')
    data = process.stdout.read()
    if vars.isWin:
        data = data.replace(b'\r\n', b'\n')
    f = open(vars.pathToScript+vars.screenshotFilename, 'wb')
    f.write(data)
    f.close()
def is_device_on():
    """Returns True if the device is on and False if the device is off."""
    process = run_adb_command('shell dumpsys power')
    data = process.stdout.read()
    return 'state=ON' in data.decode("utf-8")
def turn_on_device():
    """Turns on the device if it is turned off"""
    print('turn on phone')
    if not is_device_on():
        run_adb_command('shell input keyevent 26')
    else:
        print('device already on')
def turn_off_device():
    """Turns off the device if the device is on. It may occur that the device holds the power button too long and doesn't turn off. In that case the script runs itself again."""
    if is_device_on():
        run_adb_command('shell input keyevent 26')
    else:
        print('device already off')
    time.sleep(3)
    if is_device_on():
        print('shutdown unsuccessful, trying again')
        turn_off_device()
def is_device_connected():
    """Returns True if a phone is connected to the PC via USB and the phone has granted access to the PC."""
    process = run_adb_command('get-state')
    data = process.stdout.read().decode("utf-8")
    return not 'error' in data and 'device' in data
def wait_for_device_connect():
    """Pauses the script until a phone is connected to the PC via USB-Cable."""
    while not is_device_connected():
        time.sleep(1)
    print('\ndevice connected')
def reset_connection():
    run_adb_command('kill-server')
def start_brawlstars():
    print('starting brawlstars')
    run_adb_command('shell monkey -p com.supercell.brawlstars -c android.intent.category.LAUNCHER 1')
def stop_brawlstars():
    print('stopping brawlstars')
    run_adb_command('shell am force-stop com.supercell.brawlstars')
def update_brawlstars():
    """Not yet implemented."""
    print('opening play store')
    run_adb_command("shell am start -a android.intent.action.VIEW -d 'market://details?id=com.supercell.brawlstars'")

def wait_for_image_to_appear(imagePath):
    """Makes screenshots of the device until the specified image is recognized via cv2."""
    while True:
        image = images.load_image_from_path(vars.pathToScript + imagePath)
        get_screenshot()
        screenshot = images.load_image_from_path(vars.pathToScript+vars.screenshotFilename)
        print('searching for image', end='\r')
        if images.is_image_in_image(image, screenshot):
            break