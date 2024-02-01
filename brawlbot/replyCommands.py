from notificationManager import send_message, send_message_to_admins, send_photo, download_file
import vars
import screenshotCutter
import uploadScreenshot
import configs
import re
from my_logging import my_print as print
import os
import adbCommand as adb
import subprocess
import traceback
import threading

# a dictionary of commands with layout 'command' : helpText
commandDict = {
    '/help' : "shows this information",
    '/subscribe' : "get updates on the brawlbot",
    '/unsubscribe' : "don't get any more updates",
    '/sendScreenshot' : "send a screenshot for processing",
    '/getScreenshot' : "get the screenshots for a specific date",
    '/cancel' : "cancels all operations",
    '/startAutomation' : "starts the screenshotAutomation",
    '/stopAutomation' : "stops the screenshotAutomation",
    '/shutdown' : "turns off the raspberry pi (use in emergency only)",
    '/reboot' : "reboots the raspberry pi",
    '/restartAutomation' : "restarts the screenshot Automation script",
    '/me' : "shows the personalized config",
    '/turnOffPhone' : "Turns off the phone via ADB-Command",
    '/turnOnPhone' : "Turns on the phone via ADB-Command",
    '/git_pull': "Pulls from the git"
}

currentAutomationSubprocess = None
shouldReboot = False


def reply_help(update, chat_id):
    help = open(vars.pathToScript + 'brawlBotHelp', 'r').read() + '\n'
    for key in commandDict:
        help += '\n' + key + ' - ' + commandDict.get(key)
    send_message(help, chat_id)
def reply_subscribe(update, chat_id):
    user = configs.load_user_config(chat_id)
    if not user.get_subscribed():
        user.cancel_all().set_subscribed(True).save()
        send_message("Successfully subscribed to notifications. You can /unsubscribe to unsubscribe.", chat_id)
    else:
        send_message("You are already subscribed. You can /unsubscribe to unsubscribe.", chat_id)
def reply_unsubscribe(update, chat_id):
    user = configs.load_user_config(chat_id)
    if user.get_subscribed():
        user.cancel_all().set_subscribed(False).save()
        send_message("Successfully unsubscribed from notifications. You can /subscribe to subscribe again.", chat_id)
    else:
        send_message("You are already unsubscribed. You can /subscribe to subscribe.", chat_id)
def reply_sendScreenshot(update, chat_id):
    user = configs.load_user_config(chat_id)
    user.cancel_all().set_waitingForScreenshot(True).save()
    send_message("please send your screenshot now", chat_id)
def reply_getScreenshot(update, chat_id):
    user = configs.load_user_config(chat_id)
    user.cancel_all().set_waitingForDate(True).set_waitingForScreenshotRequest(True).save()
    send_message('Please send a date to this image in the following format: YYYY-mm-dd', chat_id)
def reply_cancel(update, chat_id):
    global shouldReboot
    user = configs.load_user_config(chat_id)
    user.cancel_all()
    shouldReboot = False
    if currentAutomationSubprocess != None:
        currentAutomationSubprocess.kill()
        send_message('Killed screenshotAutomation subprocess', chat_id)
    send_message('Canceled all actions successfully!', chat_id)
def reply_startAutomation(update, chat_id):
    config = configs.load_config()
    if not config.get_shouldRunScreenshotAutomation():
        config.set_shouldRunScreenshotAutomation(True).save()
        send_message('screenshotAutomation successfully started', chat_id)
    else:
        send_message('screenshotAutomation already running', chat_id)
def reply_stopAutomation(update, chat_id):
    config = configs.load_config()
    if config.get_shouldRunScreenshotAutomation():
        config.set_shouldRunScreenshotAutomation(False).save()
        send_message('screenshotAutomation successfully stopped', chat_id)
    else:
        send_message('screenshotAutomation already stopped', chat_id)
def reply_shutdown(update, chat_id):
    user = configs.load_user_config(chat_id)
    if user.is_admin():
        send_message('Admin recognized. Command not implemented yet.', chat_id)
    else:
        send_message('You need to be of rank Admin to run this command. It will be reported to an Admin that you tried this command.', chat_id)
        send_message_to_admins('User ' + str(chat_id) + ' tried to shutdown the raspberry pi.')
        return
def reboot():
    global shouldReboot
    shouldReboot = False
    import time
    time.sleep(5)
    # reboot the raspberry pi without sudo
    os.system('sudo shutdown -r now')
def reply_reboot(update, chat_id):
    global shouldReboot
    user = configs.load_user_config(chat_id)
    if user.is_admin():
        if shouldReboot:
            send_message('Admin recognized. Rebooting Raspberry pi in one minute.', chat_id)
            # start a thread to run reboot
            thread = threading.Thread(target=reboot)
            thread.start()
        else:
            send_message('Admin recognized. If you really want reboot, send the /reboot again. Else send /cancel.', chat_id)
            shouldReboot = True
    else:
        send_message('You need to be of rank Admin to run this command.  It will be reported to an Admin that you tried this command.', chat_id)
        send_message_to_admins('User ' + str(chat_id) + ' tried to reboot the raspberry pi.')
        return

# create a thread class
class ThreadWithReturnValue(threading.Thread):
    def __init__(self, command, chat_id):
        self.chat_id = chat_id
        threading.Thread.__init__(self)
        self.command = command

    def run(self):
        global currentAutomationSubprocess
        # run the command in the current thread and catch errors
        currentAutomationSubprocess = subprocess.Popen(self.command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
        # wait for the command to finish
        returncode = currentAutomationSubprocess.wait()
        # send the error to the user if there was one
        if returncode != 0:
            send_message('async process failed', self.chat_id)
            send_message(currentAutomationSubprocess.stderr.read(), self.chat_id)
        else:
            send_message('async process finished', self.chat_id)
        currentAutomationSubprocess = None
        

def reply_restartAutomation(update, chat_id):
    try:
        command = [vars.pythonPath, vars.pathToScript + 'brawlstarsScreenshotAutomation.py']
        # run the command without blocking the main thread and send the result when finished
        thread = ThreadWithReturnValue(command, chat_id)
        thread.start()
        send_message('async process started', chat_id)
    except Exception as e:
        send_message("failed", chat_id)
        send_message(str(e) + "\n" + str(traceback.format_exc()), chat_id)

def reply_me(update, chat_id):
    user = configs.load_user_config(chat_id)
    userDict = user.__dict__
    userConfig = ""
    for key in userDict:
        userConfig += key + ': ' + str(userDict.get(key)) + '\n'
    send_message(userConfig, chat_id)
def reply_turnOffPhone(update, chat_id):
    adb.turn_off_device()
    send_message('Phone turned off!', chat_id)
def reply_turnOnPhone(update, chat_id):
    adb.turn_on_device()
    send_message('Phone turned on!', chat_id)
def restart_bot():
    import time
    time.sleep(3)
    os.system('sudo systemctl restart brawlBot.service')
def reply_git_pull(update, chat_id):
    user = configs.load_user_config(chat_id)
    if user.is_admin():
        send_message_to_admins('Admin ' + str(chat_id) + ' pulled from git.')
        send_message('Admin recognized. Now pulling from git.', chat_id)
        # check if date is after 20.12.2023
        import datetime
        if datetime.datetime.now() > datetime.datetime(2023, 12, 20):
            # send message that token expired
            send_message('Token expired. Please get a new token.', chat_id)
            return
        # pull from git
        os.system('cd /home/piuser/BScreenshotRemastered && git pull')
        # restart the bot
        send_message('Restarting the bot to apply changes.', chat_id)
        # start a new thread to restart the bot
        thread = threading.Thread(target=restart_bot)
        thread.start()
    else:
        send_message('You need to be of rank Admin to run this command. It will be reported to an Admin that you tried this command.', chat_id)
        send_message_to_admins('User ' + str(chat_id) + ' tried to pull from git.')
        return
def reply__command_not_found(update, chat_id):
    send_message('command not found', chat_id)

def reply__date(update, chat_id):
    def is_date_valid(dateString):
        r = re.compile(r'([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))')
        return r.match(dateString) is not None

    dateString = update["message"]["text"]

    if not is_date_valid(dateString):
        send_message("your given format doesn't match YYYY-mm-dd", chat_id)
        return
    send_message("date successfully received", chat_id)

    user = configs.load_user_config(chat_id)
    if user.get_waitingForScreenshot():
        screenshotFilename = user.get_documentNames()[0]
        cuttedScreenshotFilename = user.get_documentNames()[1]

        upload1 = uploadScreenshot.upload(vars.pathToScript, cuttedScreenshotFilename, dateString=dateString)
        upload2 = uploadScreenshot.upload(vars.pathToScript, screenshotFilename, ext='_full', dateString=dateString)
        send_message(str(upload1) + '\n' + str(upload2), chat_id)
        user.set_documentNames([]).set_waitingForScreenshot(False).set_waitingForDate(False).save()
    elif user.get_waitingForScreenshotRequest():
        user.set_waitingForDate(False).set_waitingForScreenshotRequest(False).save()
        url = "https://media.brawltime.ninja/maps/competition-winners/"+dateString+".webp?size=512"
        send_message(url, chat_id)
def reply__text(update, chat_id):
    print('text received')
    
    user = configs.load_user_config(chat_id)
    if user.get_waitingForDate():
        reply__date(update, chat_id)

def reply__document(update, chat_id):
    fileType = '.' + update["message"]["document"]["mime_type"].split('/')[1]
    file_id = update["message"]["document"]["file_id"]
    user = configs.load_user_config(chat_id)
    if user.get_waitingForScreenshot() and not user.get_waitingForDate():
        screenshotFilename = 'download' + fileType
        downloadPath = vars.pathToScript + screenshotFilename
        download_file(file_id, downloadPath)

        cuttedScreenshotFilename = 'downloadCuttedScreenshot' + '.png'
        savePath = vars.pathToScript + cuttedScreenshotFilename
        send_message("Screenshot received successfully! Please wait a few seconds for the process to finish.", chat_id)
        screenshotCutter.cut(downloadPath, savePath)
        send_photo(savePath, chat_id)
        send_message('Please send a date to this image in the following format: YYYY-mm-dd', chat_id)

        user.set_documentNames([screenshotFilename, cuttedScreenshotFilename]).set_waitingForDate(True).save()
        
def reply__photo(update, chat_id):
    user = configs.load_user_config(chat_id)
    if user.get_waitingForScreenshot():
        send_message("Did you mean to send a screenshot? Try sending it as a document for no loss in quality.", chat_id)
