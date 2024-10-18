import { useNavigate } from "react-router-dom";
import { BottomWarning } from "../components/BottomWarning";
import { Button } from "../components/Button";
import { Heading } from "../components/Heading";
import { InputBox } from "../components/InputBox";
import { SubHeading } from "../components/SubHeading";
import { useState } from "react";
import axios from "axios"; // Ensure axios is imported

const Signin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State for error messages

  const handleSignin = async () => {
    setLoading(true);
    setError(""); // Clear previous errors
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/user/signin",
        {
          username,
          password,
        }
      );
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard"); // Navigate after successful signin
      } else {
        setError("Invalid credentials. Please try again."); // Handle no token
      }
    } catch (err) {
      setError("Signin failed. Please try again."); // Set error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSignin();
    }
  };

  return (
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
          <Heading label={"Sign in"} />
          <SubHeading label={"Enter your credentials to access your account"} />
          {error && <div className="text-red-500">{error}</div>} {/* Display error message */}
          <InputBox
            onChange={(e) => setUsername(e.target.value)}
            placeholder="adarsh@gmail.com"
            label={"Email"}
            onKeyDown={handleKeyDown} // Allow pressing Enter to sign in
          />
          <InputBox
            onChange={(e) => setPassword(e.target.value)}
            placeholder="123456"
            label={"Password"}
            type="password" // Ensure the password is masked
            onKeyDown={handleKeyDown} // Allow pressing Enter to sign in
          />
          <div className="pt-4">
            <Button
              onClick={handleSignin}
              label={loading ? "Signing in..." : "Sign in"}
              disabled={loading}
            />
          </div>
          <BottomWarning
            label={"Don't have an account?"}
            buttonText={"Sign up"}
            to={"/signup"}
          />
        </div>
      </div>
    </div>
  );
};

export default Signin;
