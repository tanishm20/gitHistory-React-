/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([])
  const [timer, setTimer] = useState(30)
  const [key, setKey] = useState("")
  const intervalRef = useRef(null)
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const myHeaders = new Headers();
  const localStorageKey = localStorage.getItem("Key")
  myHeaders.append("Authorization", `Bearer ${key}`);
  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  useEffect(() => {
    if (timer === 0) {
      clearInterval(intervalRef.current)
      onPress()
    }
  }, [timer])


  useEffect(() => {
    if (localStorageKey) {
      setKey(localStorageKey)
    }
  }, [localStorageKey])

  const onGetOtherCommits = async (url, arr) => {
    await fetch(url, requestOptions)
      .then(response => response.json())
      .then(result => {
        const res = (result.commit)
        const newarr = { id: result.node_id, message: res.message, author: res.author.name, timeStamp: res.author.date }
        return arr.push(newarr)
      })
      .catch(error => console.log('error', error));
  }

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => prev - 1)
    }, 1000)
  }
  const onPress = async () => {
    setData([]);
    await fetch("https://api.github.com/repos/octocat/Hello-World/branches/master", requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error("Not 200 response");
        }
        else { return response.json() }
      }
      )
      .then(async result => {
        if (result) {
          localStorage.setItem("Key", key)
        }
        let arr = []
        const parents = result.commit.parents
        const res = (result.commit.commit)
        arr.push({ id: result.commit.node_id, message: res.message, author: res.author.name, timeStamp: res.author.date })
        if (parents.length > 0) {
          parents.map((item) => {
            return onGetOtherCommits(item.url, arr)
          })
        }
        setTimeout(() => {
          clearInterval(intervalRef.current)
          setTimer(30)
          startTimer()
          setData(arr);
        }, 500)

      })
      .catch(() => {
        alert("Inavlid Key or Something went wrong")
      });
  }


  const formatTime = (localIsoDate) => {
    function z(n) { return (n < 10 ? '0' : '') + n }
    const hh = localIsoDate.getHours();
    const mm = localIsoDate.getMinutes();
    let time = z(hh) + ':' + z(mm);
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) {
      time = time.slice(1);
      time[5] = +time[0] < 12 ? ' AM' : ' PM';
      time[0] = +time[0] % 12 || 12;
    }
    return time.join('')
  }

  const DateTime = (date) => {
    const newdate = new Date(new Date(date).getTime() - (360 * 60000));
    const month = monthNames[newdate.getMonth()]
    return (`${month} ${newdate.getDate()}, ${formatTime(newdate)} `)
  }


  return (
    <div className="App" style={style.mainDiv}>
      <p>Please enter Personal access key</p>
      <input onChange={(text) => setKey(text.target.value)} style={style.inputStyle} />
      <button disabled={!key.length > 0} onClick={onPress} style={style.submitButton} >Submit</button>
      {
        data.length > 0 && data.map((item) => {
          return (
            <div key={item.id} style={style.box}>
              <p style={style.message}>
                {item.message}
              </p>
              <div style={style.divStyle}>
                <p style={style.time}>
                  {DateTime(item.timeStamp)}
                </p>
                <p style={style.time}>
                  &nbsp;
                </p>

                <p style={style.author}>
                  {`by ${item.author}`}
                </p>
              </div>


            </div>
          )

        })
      }
      {
        data.length > 0 &&
        <div>
          <button onClick={() => {
            clearInterval(intervalRef.current)
            setTimer(30)
            onPress()
          }} >Refresh Page </button>
          <span style={style.message}>{` ${timer}`}</span>
        </div>
      }
    </div>
  );
}

const style = {
  mainDiv: {
    marginTop: 50,
  },
  inputStyle: {
    width: '30%'
  },
  submitButton: {
    marginBottom: 10
  },
  box: {
    flex: 1,
    fontSize: '18px',
    margin: 'auto',
    border: '1px solid #bebebe',
    borderRadius: 10,
    marginBottom: 10,
    width: "30%",
    paddingLeft: 10,
    paddingRight: 10
  },
  divStyle: {
    display: "flex"
  },
  message: {
    textAlign: "left",
    fontSize: 14,
    fontWeight: "bold"
  },
  time: {
    textAlign: "left",
    fontSize: 12,
  },
  author: {
    textAlign: "left",
    fontSize: 12,
    fontWeight: "bold"
  }

}
export default App;
