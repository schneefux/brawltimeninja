import sys
import threading
import _thread as thread
import signal
import time
from my_logging import my_print as print

def start_timed_execution(function):
    '''
    returns True if ended successfully\n
    returns False if not ended in time
    '''
    try:
        function()
    except KeyboardInterrupt:
        return False
    return True
def quit_function(fn_name):
    # print to stderr, unbuffered in Python 2.
    print('Process took too long')
    sys.stderr.flush() # Python 3 stderr is likely buffered.
    thread.interrupt_main() # raises KeyboardInterrupt
def exit_after(s):
    '''
    use as decorator to exit process if 
    function takes longer than s seconds
    '''
    def outer(fn):
        def inner(*args, **kwargs):
            timer = threading.Timer(s, quit_function, args=[fn.__name__])
            timer.start()
            try:
                result = fn(*args, **kwargs)
            finally:
                timer.cancel()
            return result
        return inner
    return outer