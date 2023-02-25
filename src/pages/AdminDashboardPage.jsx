import React from "react";
import { useContext } from "react";
import { useCallback } from "react";
import { useDrag, useDrop } from "react-dnd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "../authContext";
import update from "immutability-helper";
import { useRef } from "react";

const ItemTypes = {
  CARD: "card",
};

const TableItem = (props) => {
  const originalIndex = props.index;
  const ref = useRef(null);
  const { id } = props;

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, originalIndex };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.originalIndex;
      const hoverIndex = originalIndex;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      const clientOffset = monitor.getClientOffset();

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      props.moveCard(dragIndex, hoverIndex);

      item.originalIndex = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <ul
      ref={ref}
      style={{
        border: isDragging ? "#7CDB00 1px solid" : "1px solid #696969",
        padding: "10px",
      }}
      className="rounded-lg p-4 list-style-none my-4 text-thin text-lg flex gap-10 items-center"
      data-handler-id={handlerId}
    >
      <li>01</li>
      <li className="flex gap-6 w-2/4">
        <img
          src={props.photo}
          className="aspect-video w-32 rounded-md"
          alt="title"
        />
        <span className="self-center text-white">{props.title}</span>
      </li>
      <li className="w-1/3 flex gap-2">
        {" "}
        <img
          src="https://picsum.photos/200/200"
          className="w-8 rounded-full"
          alt="logo"
        />
        <span
          style={{
            color: "#7CDB00",
          }}
        >
          {props.username}
        </span>
      </li>
      <li className="flex items-center gap-2 text-white">
        <span>{props?.like}</span>
        <svg
          width="14"
          height="18"
          viewBox="0 0 14 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7.01001 1.51001V16.5" stroke="#7CDB00" />
          <path
            d="M1.02301 7.51405L7.00001 1.49805L12.977 7.51405"
            stroke="#7CDB00"
          />
        </svg>
      </li>
    </ul>
  );
};
const AdminDashboardPage = () => {
  const [tableData, setTableData] = useState([]);
  const [page, setPaginate] = useState(1);
  const [token, setToken] = useState("");

  const navigate = useNavigate();
  const { state, dispatch } = useContext(AuthContext);

  const moveCard = useCallback((dragIndex, hoverIndex) => {
    setTableData((tableData) =>
      update(tableData, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, tableData[dragIndex]],
        ],
      })
    );
  }, []);
  const renderCard = useCallback((tabledat, index) => {
    return (
      <TableItem
        key={index}
        like={tabledat?.like}
        photo={tabledat?.photo}
        id={tabledat?.id}
        title={tabledat?.title}
        username={tabledat?.username}
        index={index}
        moveCard={moveCard}
      ></TableItem>
    );
  }, []);
  const getData = useCallback(async () => {
    if (token !== "") {
      let auth = `Bearer ${token}`;

      fetch("https://reacttask.mkdlabs.com/v1/api/rest/video/PAGINATE", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
          "X-Project":
            "cmVhY3R0YXNrOmQ5aGVkeWN5djZwN3p3OHhpMzR0OWJtdHNqc2lneTV0Nw==",
        },
        body: JSON.stringify({
          payload: {},
          page: page,
          limit: 10,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setTableData(data.list);
        })
        .catch((err) => {
          throw new Error(err.message);
        });
    }
  }, [page, token]);

  useEffect(() => {
    getData();

    if (token === "") setToken(localStorage.getItem("token"));
  }, [getData]);
  return (
    <>
      <div
        className="w-full text-white py-10"
        style={{
          backgroundColor: "#111111",
          minHeight: "100vh",
          margin: "0",
        }}
      >
        <div className="px-20  ">
          <nav className="flex justify-between">
            <h1 className=" text-5xl font-extrabold">APP</h1>
            <button
              style={{
                backgroundColor: "#9bff00",
                color: "#696969",
              }}
              className="flex gap-4 p-2 px-4 rounded-full items-center"
              onClick={(e) => {
                e.preventDefault();

                dispatch({
                  payload: {},
                  type: "LOGOUT",
                });
                navigate("/admin/login");
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 20C5 17.544 6.991 15.553 9.447 15.553H14.553C17.009 15.553 19 17.544 19 20"
                  stroke="#696969"
                />
                <path
                  d="M15.0052 5.2448C16.6649 6.90453 16.6649 9.59548 15.0052 11.2552C13.3455 12.9149 10.6545 12.9149 8.9948 11.2552C7.33507 9.59548 7.33507 6.90453 8.9948 5.2448C10.6545 3.58507 13.3455 3.58507 15.0052 5.2448"
                  stroke="#696969"
                />
              </svg>
              Logout
            </button>
          </nav>
          <section className="mt-32 font-thin">
            <div className="flex justify-between ">
              <h1 className="text-5xl ">Today's leaderboard</h1>
              <button
                style={{
                  backgroundColor: "#1D1D1D",
                }}
                className="p-4 px-6 text-lg rounded-xl"
              >
                30 May 2022 •
                <span
                  style={{
                    backgroundColor: "#9bff00",
                    color: "#696969",
                  }}
                  className="p-2 py-1 mx-2 rounded-md"
                >
                  {" "}
                  Submissions OPEN{" "}
                </span>
                • 11:34
              </button>
            </div>
            <div className="flex flex-col">
              <div
                className="w-full mt-6"
                style={{
                  color: "#696969",
                }}
              >
                <ul className="list-style-none text-thin text-lg flex justify-between px-2">
                  <li className="text-center">#</li>
                  <li className="text-start w-2/4">Title</li>
                  <li className="w-1/3">Author</li>
                  <li className="flex items-center">
                    Most Liked
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g>
                        <path d="M8 10L12 14L16 10" stroke="#696969" />
                      </g>
                      <defs>
                        <clipPath id="clip0_108_27345">
                          <rect width="24" height="24" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </li>
                </ul>
                <div>
                  {tableData?.length > 0 &&
                    tableData.map((tabledat, index) =>
                      renderCard(tabledat, index)
                    )}
                </div>
              </div>
              <div className="self-end flex gap-4">
                <button
                  onClick={() => {
                    if (!(page === 1)) {
                      setPaginate((page) => {
                        return page - 1;
                      });
                    }
                  }}
                  className="border-blue-50 border px-2 rounded-md"
                >
                  prev
                </button>
                <button
                  className="border-blue-50 border px-2 rounded-md"
                  onClick={() => {
                    setPaginate((page) => {
                      return page + 1;
                    });
                  }}
                >
                  next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
