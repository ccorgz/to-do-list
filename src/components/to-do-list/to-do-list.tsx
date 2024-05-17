/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { IoSend, IoTrash } from "react-icons/io5";
import { useEffect, useState } from "react";
import styles from "./to-do-list.module.css";
import { Button, Input, dialog, toast } from "reactivus";

type TaskProps = {
  id: number;
  description: string;
};

export default function ToDoList() {
  const [taskList, setTaskList] = useState<Array<TaskProps>>([]);

  const [lastTaskAction, setLastTaskAction] = useState<"insert" | "remove">(
    "insert"
  );

  const handleTaskListInsert = (description: string): boolean => {
    try {
      setLastTaskAction("insert");
      setTaskList((prevTask: Array<TaskProps>) => {
        return [
          ...prevTask,
          ...[
            {
              id: +(
                prevTask.reduce(
                  (max: number, task: TaskProps) => Math.max(max, task.id),
                  -1
                ) + 1
              ),
              description: description,
            },
          ],
        ];
      });
      return true;
    } catch {
      return false;
    }
  };
  const handleTaskListRemove = (id: number): boolean => {
    try {
      setLastTaskAction("remove");
      setTaskList((prevTask: Array<TaskProps>) => {
        const newTaskArrayList = [
          ...prevTask.filter((task: TaskProps) => task.id != id),
        ];
        newTaskArrayList.length == 0 && removeAllTasksFromStorage();
        return newTaskArrayList.length > 0 ? newTaskArrayList : [];
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleTaksListScrollInto = () => {
    const lastTaskInList = taskList[taskList.length - 1] ?? [];
    const cardToScrollInto = document.getElementById(
      lastTaskInList.id + lastTaskInList.description
    );
    cardToScrollInto &&
      cardToScrollInto.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSaveTaksListInStorage = () => {
    if (window) {
      try {
        window.localStorage.setItem("ccorgzTaskList", JSON.stringify(taskList));
      } catch {
        console.log("Unknown error when trying to save list in storage.");
      }
    }
  };

  const handleGetTaskListInStorage = () => {
    if (window) {
      try {
        const listInStorage = JSON.parse(
          window.localStorage.getItem("ccorgzTaskList") ?? ""
        );
        listInStorage.length > 0 && setTaskList(listInStorage);
      } catch {
        console.log("Unknown error when trying to get list in storage.");
      }
    }
  };

  const handleRemoveAllTasksFromStorage = () => {
    if (taskList.length == 0) {
      toast.warning("No list found in storage.");
    } else {
      dialog
        .show({
          icon: "question",
          title: "Are u sure?",
          text: "The tasks will be permanently removed.",
          showConfirmButton: true,
          showCancelButton: true,
          confirmButtonText: "Yes, remove",
          cancelButtonText: "No, cancel",
        })
        .then((res) => {
          if (res.isConfirmed) {
            removeAllTasksFromStorage();
          }
        });
    }
  };

  const removeAllTasksFromStorage = () => {
    try {
      window.localStorage.removeItem("ccorgzTaskList");
      setTaskList([]);
    } catch {
      console.log("Unknown error when trying to delete list in storage.");
    }
  };

  useEffect(() => {
    if (lastTaskAction == "insert") {
      handleTaksListScrollInto();
    }
    if (taskList.length > 0) {
      handleSaveTaksListInStorage();
    } else {
      handleGetTaskListInStorage();
    }
  }, [taskList]);

  return (
    <section className={styles.toDoListMainBox}>
      <div className={styles.toDoListBox + " " + styles.glassEffect}>
        <div className={styles.toDoListHeader}>
          <Input
            type="text"
            placeholder="Create new task"
            className={styles.customInput}
            icon={<IoSend />}
            iconPosition="right"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.target instanceof HTMLInputElement && e.key == "Enter") {
                e.target.value = handleTaskListInsert(e.target.value)
                  ? ""
                  : e.target.value;
              }
            }}
          />
        </div>
        <div className={styles.toDoListBody}>
          {taskList?.map((task: TaskProps) => {
            return (
              <div
                key={task.id}
                className={styles.taskCard + " " + styles.glassEffect}
                id={task.id + task.description}
              >
                <p>{task.description}</p>
                <Button
                  style="btn-dark"
                  icon={<IoTrash />}
                  tooltip="Remove This Task"
                  tooltipPosition="right"
                  size="btn-sm"
                  onClick={() => {
                    handleTaskListRemove(task.id);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
