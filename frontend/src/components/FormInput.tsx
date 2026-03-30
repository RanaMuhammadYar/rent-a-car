import React, { useState, useEffect } from 'react';
import { LucideIcon, Eye, EyeOff, Calendar } from 'lucide-react';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>, 'onChange'> {
  label: string;
  icon?: LucideIcon;
  error?: string;
  isTextArea?: boolean;
  selectDate?: boolean;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  icon: Icon, 
  error, 
  isTextArea = false, 
  selectDate = false,
  className = '', 
  type,
  value,
  onChange,
  name,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Date selection state
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Initialize date selection from value prop (YYYY-MM-DD format)
  useEffect(() => {
    if (selectDate && value && typeof value === 'string') {
      const parts = value.split('-');
      if (parts.length === 3) {
        setYear(parts[0]);
        setMonth((parseInt(parts[1]) - 1).toString());
        setDay(parseInt(parts[2]).toString());
      }
    }
  }, [selectDate, value]);

  // Handle changes in date selects
  const handleDateChange = (d: string, m: string, y: string) => {
    setDay(d);
    setMonth(m);
    setYear(y);

    if (d && m && y && onChange) {
      const formattedMonth = (parseInt(m) + 1).toString().padStart(2, '0');
      const formattedDay = d.padStart(2, '0');
      const formattedValue = `${y}-${formattedMonth}-${formattedDay}`;
      onChange({ target: { name, value: formattedValue } });
    }
  };

  const inputClasses = `w-full bg-background border border-border rounded-xl py-2.5 ${
    Icon ? 'pl-11' : 'px-4'
  } ${isPassword ? 'pr-12' : 'pr-4'} text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 shadow-sm ${
    error ? 'border-destructive focus:ring-destructive/50' : 'hover:border-primary/50'
  } ${className}`;

  if (selectDate) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => (currentYear - 25 + i).toString());

    return (
      <div className="space-y-1.5 animate-in">
        <label className="block text-sm font-semibold text-muted-foreground ml-1">{label}</label>
        <div className="grid grid-cols-3 gap-2">
          {/* Day */}
          <select
            className={inputClasses}
            value={day}
            onChange={(e) => handleDateChange(e.target.value, month, year)}
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => (i + 1).toString()).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {/* Month */}
          <select
            className={inputClasses}
            value={month}
            onChange={(e) => handleDateChange(day, e.target.value, year)}
          >
            <option value="">Month</option>
            {months.map((m, i) => (
              <option key={m} value={i.toString()}>{m}</option>
            ))}
          </select>
          {/* Year */}
          <select
            className={inputClasses}
            value={year}
            onChange={(e) => handleDateChange(day, month, e.target.value)}
          >
            <option value="">Year</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {error && <p className="text-destructive text-xs font-medium ml-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 animate-in">
      <label className="block text-sm font-semibold text-muted-foreground ml-1">{label}</label>
      <div className="relative group">
        {Icon && (
          <Icon 
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
            size={20} 
          />
        )}
        
        {isTextArea ? (
          <textarea 
            className={inputClasses.replace('py-2.5', 'py-2.5 min-h-[120px]')} 
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} 
            value={value}
            onChange={onChange as any}
            name={name}
          />
        ) : (
          <input 
            type={inputType}
            className={inputClasses} 
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)} 
            value={value}
            onChange={onChange as any}
            name={name}
          />
        )}

        {isPassword && !isTextArea && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-destructive text-xs font-medium mt-1.5 ml-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
