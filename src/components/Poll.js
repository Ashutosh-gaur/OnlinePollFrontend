import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PollApp() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [polls, setPolls] = useState([]);

  // handle option change
  const handleOptionChange = (value, index) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // add new option
  const addOption = () => {
    setOptions([...options, ""]);
  };

  const deleteOption = (index) => {
    if (index < 2) return; 

    const newOptions = options.filter((_,i) => i !== index);
    setOptions(newOptions);
  };


  // create poll
  const createPoll = async () => {
    if (!question.trim() || options.filter((o) => o.trim()).length < 2) {
      alert("Please enter a question and at least 2 options");
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_BASEURL}/api/polls/createPoll`, {
        question,
        options: options.filter((o) => o.trim()).map((opt) => ({ text: opt })),
      });
      setPolls([...polls, res.data]);
      setQuestion("");
      setOptions(["", ""]);
    } catch (error) {
      console.error("Error creating poll", error);
    }
  };

  // vote on poll
  const votePoll = async (pollId, optionId) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BASEURL}/api/polls/${pollId}/vote/${optionId}`
      );
      const updatedPolls = polls.map((p) =>
        p.id === res.data.id ? res.data : p
      );
      setPolls(updatedPolls);
    } catch (error) {
      console.error("Error voting", error);
    }
  };

  // fetch all polls
  const fetchPolls = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BASEURL}/api/polls/getPolls`);
      setPolls(res.data);
    } catch (err) {
      console.error("Error fetching polls", err);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center p-6">
      {/* Create Poll Section */}
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-lg mb-10 border-t-4 border-blue-500">
        <h1 className="text-3xl font-extrabold mb-4 text-center text-blue-600">
          🗳️ Create a Poll
        </h1>

        <input
          type="text"
          placeholder="Enter poll question"
          className="w-full border rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {options.map((opt, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder={`Option ${index + 1}`}
              className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={opt}
              onChange={(e) => handleOptionChange(e.target.value, index)}
            />
            {/* Show delete button only for options after 2nd one */}
            {index >= 2 && (
              <button
                 onClick={() => deleteOption(index)}
                className="bg-red-500 text-white text-lg flex items-center justify-center min-w-7 min-h-7 rounded-full hover:bg-red-600 transition"
              >
               ⨯
              </button>
            )}
          </div>
        ))}

        <div className="flex gap-3 mt-4">
          <button
            onClick={addOption}
            className="flex-1 bg-yellow-400 text-white font-semibold py-2 rounded-xl hover:bg-yellow-500 transition"
          >
            ➕ Add Option
          </button>
          <button
            onClick={createPoll}
            className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-xl hover:bg-blue-700 transition"
          >
            ✅ Create Poll
          </button>
        </div>
      </div>

      {/* Available Polls */}
      <h2 className="text-3xl font-bold mb-6 text-center text-purple-700">
        📋 Available Polls
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {polls.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center">
            No polls created yet.
          </p>
        ) : (
          polls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum, opt) => sum + opt.votes,
              0
            );
            return (
              <div
                key={poll.id}
                className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition cursor-pointer border-t-4 border-purple-400"
              >
                <h3 className="font-bold text-xl mb-4 text-gray-800">
                  {poll.question}
                </h3>

                {poll.options.map((opt, idx) => {
                  const percentage =
                    totalVotes > 0
                      ? ((opt.votes / totalVotes) * 100).toFixed(1)
                      : 0;

                  //  Dynamic bar colors
                  const barColors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-orange-500",
                  ];

                  return (
                    <div
                      key={opt.id}
                      className="mb-3"
                      onClick={() => votePoll(poll.id, opt.id)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">
                          {opt.text}
                        </span>
                        <span className="text-sm text-gray-600">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${barColors[idx % barColors.length]} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}

                <p className="text-sm text-gray-500 mt-4">
                  Total votes: {totalVotes}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
