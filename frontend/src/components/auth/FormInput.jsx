import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";

const FormInput = ({
	type,
	label,
	placeholder,
	value,
	onChange,
	name,
	icon,
	disabled,
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const inputType = type === "password" && showPassword ? "text" : type;
	const iconClass = "size-5 text-base-content/40";
	const inputClass = "input input-bordered w-full pl-10";

	return (
		<div className="form-control">
			<label className="label">
				<span className="label-text font-medium">{label}</span>
			</label>
			<div className="relative">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center">
					{icon === "user" && <User className={iconClass} />}
					{icon === "mail" && <Mail className={iconClass} />}
					{icon === "lock" && <Lock className={iconClass} />}
				</div>
				<input
					type={inputType}
					className={inputClass}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					disabled={disabled}
					name={name}
				/>
				{type === "password" && (
					<button
						type="button"
						className="absolute inset-y-0 right-0 pr-3 flex items-center"
						onClick={() => setShowPassword(!showPassword)}
					>
						{showPassword ? <EyeOff className={iconClass} /> : <Eye className={iconClass} />}
					</button>
				)}
			</div>
		</div>
	);
};

export default FormInput;