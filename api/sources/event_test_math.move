/// Module: counter
/// A simple counter module example that doesn't depend on std library
module test_math::counter {
    
    /// Defines a counter struct
    struct Counter has key, store, drop {
        value: u64
    }
    
    /// Defines a custom account type for testing
    struct Account has key, store, drop {
        addr: address
    }

    struct ValueInfo has drop {
        step_name: vector<u8>,  
        value: u64           
    }

    public fun create_value_info(step_name: vector<u8>, value: u64): ValueInfo {
        ValueInfo { step_name, value }
    }
    
    public fun get_info_value(info: &ValueInfo): u64 {
        info.value
    }

    /// Creates a new counter and returns it
    public fun create(): Counter {
        Counter { value: 0 }
    }

    /// Increments the counter value
    public fun increment(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }
    
    /// Gets the counter value
    public fun get_value(counter: &Counter): u64 {
        counter.value
    }

    /// Simple math operations
    public fun add(a: u64, b: u64): u64 {
        a + b
    }
    
    public fun subtract(a: u64, b: u64): u64 {
        a - b
    }
    
    public fun multiply(a: u64, b: u64): u64 {
        a * b
    }

    struct MathSteps has drop {
        step1_initial_value: ValueInfo,
        step2_after_add: ValueInfo,
        step3_after_multiply: ValueInfo,
        step4_final_result: ValueInfo
    }

    public fun test_math(): u64 {
        let initial_value = 5;
        
        let after_add = add(initial_value, 10);  // 5 + 10 = 15
        
        let after_multiply = multiply(after_add, 2);  // 15 * 2 = 30
        
        let final_value = subtract(after_multiply, 5);  // 30 - 5 = 25
        
        final_value
    }
    

    public fun test_math_verbose(): MathSteps {
        let initial_value = 5;
        let step1_info = create_value_info(b"Step 1: Initial value", initial_value);
        
        let after_add = add(initial_value, 10);  // 5 + 10 = 15
        let step2_info = create_value_info(b"Step 2: After adding 10", after_add);
        
        let after_multiply = multiply(after_add, 2);  // 15 * 2 = 30
        let step3_info = create_value_info(b"Step 3: After multiplying by 2", after_multiply);
        
        let final_value = subtract(after_multiply, 5);  // 30 - 5 = 25
        let step4_info = create_value_info(b"Step 4: Final result (after subtracting 5)", final_value);
        
        MathSteps {
            step1_initial_value: step1_info,
            step2_after_add: step2_info,
            step3_after_multiply: step3_info,
            step4_final_result: step4_info
        }
    }
    
    struct CounterSteps has drop {
        step1_initial: ValueInfo,
        step2_after_first_increment: ValueInfo,
        step3_after_second_increment: ValueInfo
    }

    public fun test_counter(): u64 {
        let counter = create();
        
        increment(&mut counter);
        
        increment(&mut counter);
        
        let final_value = get_value(&counter);
        
        final_value
    }
    
    public fun test_counter_verbose(): CounterSteps {
        let counter = create();
        let initial_value = get_value(&counter);
        let step1_info = create_value_info(b"Step 1: Initial counter value", initial_value);
        
        increment(&mut counter);
        let value_after_first = get_value(&counter);
        let step2_info = create_value_info(b"Step 2: After first increment", value_after_first);
        
        increment(&mut counter);
        let value_after_second = get_value(&counter);
        let step3_info = create_value_info(b"Step 3: After second increment", value_after_second);
        
        CounterSteps {
            step1_initial: step1_info,
            step2_after_first_increment: step2_info,
            step3_after_second_increment: step3_info
        }
    }
}