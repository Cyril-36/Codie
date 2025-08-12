def calculate_factorial(n):
    """Calculate factorial of a number."""
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    elif n == 0 or n == 1:
        return 1
    else:
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result

def fibonacci(n):
    """Calculate nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the functions
if __name__ == "__main__":
    print(f"Factorial of 5: {calculate_factorial(5)}")
    print(f"10th Fibonacci number: {fibonacci(10)}")
