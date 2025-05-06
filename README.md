# How to run

SSH using this command, replacing user with whatever your username is 
- ssh -L 3306:cse-mysql-classes-01.cse.umn.edu:3306 user@login02.cselabs.umn.edu

Now, run this command
- mysql -u C4131S25S02U87 -hcse-mysql-classes-01.cse.umn.edu -P3306 -p C4131S25S02U87

The password is zhen0506

Now with this running, open the todolist project. 
In the root directory of the project, run
- npm run start

You should now have all the things necessary to use the todo list. 

## Accounts

There are 2 accounts already in the database
1. username=anth, password=zheng
2. username=anthony, password=zheng

These accounts already have some todos in them that unique to each account. 

