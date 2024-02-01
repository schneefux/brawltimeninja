import subprocess
import threading

# a shell command to wait 3 seconds and then print "hello world"
command = "sleep 3 && echo 'hello world'"

# create a thread class
class CommandThread(threading.Thread):
    def __init__(self, command):
        threading.Thread.__init__(self)
        self.command = command

    def run(self):
        # run the command in the current thread
        p = subprocess.run(self.command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
        # print the output
        print(p.stdout)
        # print the error
        print(p.stderr)

# create a thread and start it
thread = CommandThread(command)
thread.start()

# do something else while the thread is running
print('doing something else')

# wait for the thread to finish
thread.join()

# print the result
