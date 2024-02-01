import json
import vars
from collections import namedtuple
import os
import time
from my_logging import my_print as print

class User:
    """A class that stores parameters of a user in a file named after the userId.config"""
    def __init__(self, userId, subscribed=False, waitingForScreenshot=False, waitingForScreenshotRequest=False, rank=[], waitingForDate=False, documentNames=None):
        """Initlialize the User class with a userId and optional parameters"""
        self.userId, self.subscribed, self.waitingForScreenshot, self.waitingForScreenshotRequest, self.rank, self.waitingForDate, self.documentNames = userId, subscribed, waitingForScreenshot, waitingForScreenshotRequest, rank, waitingForDate, documentNames
    def save(self):
        """Saves the configuration to a file named <userId>.config"""
        save_user_config(self, self.userId)
#------------------------------------------#
    def get_subscribed(self):
        """Returns whether the user is subscribed to broadcast messages"""
        return self.subscribed
    def set_subscribed(self, value):
        """Sets the subscription status of the user to broadcast messages to True or False. Don't forget to save() afterwards."""
        self.subscribed = value
        if value:
            load_config().add_subscriber(self.userId).save()
        else:
            load_config().remove_subscriber(self.userId).save()
        return self
#------------------------------------------#
    def get_waitingForScreenshot(self):
        """Returns whether the script is waiting to receive a screenshot as a document from the user."""
        return self.waitingForScreenshot
    def set_waitingForScreenshot(self, value):
        """Set whether the script is waiting to reveice a screenshot as a document from the user. Don't forget to save() afterwards."""
        self.waitingForScreenshot = value
        return self
#------------------------------------------#
    def get_waitingForScreenshotRequest(self):
        """Returns whether the script is waiting for a date input and sending a screenshot afterwards"""
        return self.waitingForScreenshotRequest
    def set_waitingForScreenshotRequest(self, value):
        """Set whether the script should be returning a screenshot after the user types in a date. Don't forget to save() afterwards."""
        self.waitingForScreenshotRequest = value
        return self
#------------------------------------------#
    def get_rank(self):
        """Returns the ranks of a user as an array of String."""
        return self.rank
    def is_admin(self):
        """Returns whether the user is an admin as True or False."""
        return "Admin" in self.rank
    #Todo methods to add rank and to remove rank from the rank list
    def set_rank(self, value):
        """Sets the rank of the user. Highest rank is Admin. This script is commented out for safety purposes. Don't forget to save() afterwards."""
    #     self.rank = value
        return self
#------------------------------------------#
    def get_waitingForDate(self):
        """Returns whether the script is waiting for a user input in form of a date string as True or False."""
        return self.waitingForDate
    def set_waitingForDate(self, value):
        """Set to True to wait for the user to input a date string. Don't forget to save() afterwards."""
        self.waitingForDate = value
        return self
#------------------------------------------#
    def get_documentNames(self):
        """Returns the names of documents that are stored in vars.pathToScript."""
        return self.documentNames
    def set_documentNames(self, value):
        """Set the names of documents that are stored in vars.pathToScript. Dont't forget to save() afterwards"""
        self.documentNames = value
        return self
#------------------------------------------#
    def cancel_all(self):
        """Cancels all activities by setting all booleans to their default "False" state. Executes the save() command by itself."""
        self.set_waitingForDate(False).set_waitingForScreenshot(False).set_waitingForScreenshotRequest(False).save()
        return self
#------------------------------------------#


class Config:
    """This class stores the configurations of the entire script in the config.config"""
    def __init__(self, subscribers=[], shouldRunScreenshotAutomation=False):
        self.subscribers, self.shouldRunScreenshotAutomation = subscribers, shouldRunScreenshotAutomation
    def save(self):
        save_config(self)
#------------------------------------------#
    def add_subscriber(self, sub):
        """Add a subscriber to the config. Don't forget to save() afterwards."""
        if not sub in self.subscribers:
            self.subscribers.append(sub)
        return self
    def remove_subscriber(self, sub):
        """Remove a subscriber from the config. Don't forget to save() afterwards."""
        if sub in self.subscribers:
            self.subscribers.remove(sub)
        return self
#------------------------------------------#
    def get_shouldRunScreenshotAutomation(self):
        """Returns True if the BSA script should be running every day at 10:30am or False if it shouldn't."""
        return self.shouldRunScreenshotAutomation
    def set_shouldRunScreenshotAutomation(self, value):
        """Set the boolean which determines whether the BSA script should be running every day at 10:30am or False if it shouldn't. Don't forget to save() afterwards."""
        self.shouldRunScreenshotAutomation = value
        return self
#------------------------------------------#
def save_user_config(user, userId):
    """Saves the specified user config under the userId."""
    userData = json.dumps(user.__dict__)
    open(vars.pathToScript + str(userId) + '.config', 'w+').write(userData)
def load_user_config(userId):
    """Loads the user config by a given userId = chat_id and returns it as a User class. Returns a new class if it couldn't load."""
    userDataFilename = vars.pathToScript + str(userId)
    userDataPath = userDataFilename + '.config'
    if not os.path.exists(userDataPath):
        return User(userId)
    userData = open(userDataPath, 'r').read()
    try:
        return User(**json.loads(userData))
    except Exception as e:
        print(e)
        open(userDataFilename + '_backup_' + str(time.time()), 'w+').write(userData)
        return User(userId)
#------------------------------------------#
def save_config(config):
    """Saves the general config.config."""
    configData = json.dumps(config.__dict__)
    open(vars.pathToScript + 'config.config', 'w+').write(configData)
def load_config():
    """Loads the general config.config and returns it as a Config class. Returns a new class if it couldn't load."""
    configDataFilename = vars.pathToScript + 'config'
    configDataPath = configDataFilename + '.config'
    if not os.path.exists(configDataPath):
        return Config()
    configData = open(configDataPath, 'r').read()
    try:
        return Config(**json.loads(configData))
    except Exception as e:
        print(e)
        open(configDataFilename + '_backup_' + str(time.time()), 'w+').write(configData)
        return Config()