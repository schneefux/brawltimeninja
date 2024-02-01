#!/usr/bin/python3
import time
import os
import uploadScreenshot
import screenshotCutter
import images
import adbCommand as adb
import vars
import executionManager
import notificationManager
import configs
from my_logging import my_print as print
import my_socket

@executionManager.exit_after(160)
def get_automated_screenshot():
    """Runs the script that automatically saves the screenshot as screenshot.png. If it doesn't finish within 120 seconds it throws an error."""
    adb.turn_on_device()
    adb.stop_brawlstars()
    time.sleep(3)
    adb.start_brawlstars()
    adb.wait_for_image_to_appear('SettingsButton.png')
    print('tapping info button')
    adb.tap(1050, 1000)
    adb.wait_for_image_to_appear('Home.png')
    print('tapping community tab')
    adb.tap(1500, 1020)
    time.sleep(2)
    positions = [1750, 1200, 1040, 630, 470, 230]
    for pos in positions:
        for i in range(2 if pos != 1750 else 1): #try again if didnt work (for unlocking event)
            print('tapping info button')
            adb.tap(pos, 600)
            time.sleep(1)
    adb.wait_for_image_to_appear('ExitButton.png')
    print('tapping heart')
    adb.tap(1530, 330)
    time.sleep(2)
    adb.get_screenshot()
    adb.stop_brawlstars()
    adb.turn_off_device()

# Check if automation is already running and raise an error if it is
if (my_socket.get_lock("brawlbot")):
    raise Exception("brawlbot already running")
config = configs.load_config()
if config.get_shouldRunScreenshotAutomation():
    startTime = time.time()

    adb.wait_for_device_connect()
    failCounter = 0
    while not executionManager.start_timed_execution(get_automated_screenshot) and failCounter < 5:
        print('starting Script')
        failCounter += 1
        pass
    if failCounter >= 5:
        print('script failed')
        adb.get_screenshot()
        time.sleep(1)
        notificationManager.broadcast_to_subscribers(message='script failed 5 times in a row', photoPath=vars.pathToScript+vars.screenshotFilename)
    else:
        screenshot =  images.load_image_from_path(vars.pathToScript+vars.screenshotFilename)
        backButtonImage =  images.load_image_from_path(vars.pathToScript+'Heart.png')
        if screenshot is not None and images.is_image_in_image(backButtonImage, screenshot):
            print('image correct, uploading...')
            screenshotCutter.cut(vars.pathToScript + vars.screenshotFilename, vars.pathToScript + vars.cuttedscreenshotFilename)
            uploadScreenshot.upload(vars.pathToScript, vars.cuttedscreenshotFilename)
            uploadScreenshot.upload(vars.pathToScript, vars.screenshotFilename, "_full")
            notificationManager.broadcast_to_subscribers(photoPath=vars.pathToScript + vars.cuttedscreenshotFilename, message='Screenshot uploaded')
        else:
            print('screenshot not right')
            notificationManager.broadcast_to_subscribers(message='screenshot failed', photoPath=vars.pathToScript+vars.screenshotFilename)

    print('process took', time.time()-startTime, 's')
else:
    print('process not started')
