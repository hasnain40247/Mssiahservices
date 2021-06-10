#include <stdio.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
 
int main(void)
{
pid_t pid=fork();
    if(pid==0)
    {
        printf("Process B=>PPID: %d PID: %d\n",getppid(),getpid());
        pid_t pid2=fork();
        if(pid2==0)
        {
            printf("Process C=>PPID: %d PID: %d\n",getppid(),getpid());
        }
        else if(pid2>0)
        {
            wait(NULL);
        }
        else
        {
            printf("Unable to create child process\n");
        }
    }
    else if(pid>0)
    {
        printf("Process A=> PID: %d\n",getpid());
        wait(NULL);
    }
    else
    {
        printf("Unable to create child process\n");
    }
}