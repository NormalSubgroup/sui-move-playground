/// Module: counter
/// A simple counter module example that doesn't depend on std library
module coin::counter {
    use std::signer;
    
    /// Defines a counter struct
    struct Counter has key {
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
    public fun increment(account: &signer) acquires Counter {
        let counter = borrow_global_mut<Counter>(signer::address_of(account));
        counter.value = counter.value + 1;
    }
    
    /// Gets the counter value
    public fun get_count(account_addr: address): u64 acquires Counter {
        borrow_global<Counter>(account_addr).value
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
    
    struct SimpleArray has drop {
        v0: u64,
        v1: u64,
        v2: u64,
        v3: u64,
        v4: u64,
        v5: u64,
        v6: u64,
        v7: u64,
        v8: u64,
        size: u64
    }
    
    public fun create_array(): SimpleArray {
        SimpleArray { 
            v0: 0, v1: 0, v2: 0, v3: 0, v4: 0, 
            v5: 0, v6: 0, v7: 0, v8: 0, 
            size: 0 
        }
    }
    
    public fun add_to_array(arr: &mut SimpleArray, value: u64) {
        if (arr.size == 0) { arr.v0 = value; arr.size = 1; return; }
        if (arr.size == 1) { arr.v1 = value; arr.size = 2; return; }
        if (arr.size == 2) { arr.v2 = value; arr.size = 3; return; }
        if (arr.size == 3) { arr.v3 = value; arr.size = 4; return; }
        if (arr.size == 4) { arr.v4 = value; arr.size = 5; return; }
        if (arr.size == 5) { arr.v5 = value; arr.size = 6; return; }
        if (arr.size == 6) { arr.v6 = value; arr.size = 7; return; }
        if (arr.size == 7) { arr.v7 = value; arr.size = 8; return; }
        if (arr.size == 8) { arr.v8 = value; arr.size = 9; return; }
    }
    
    public fun get_from_array(arr: &SimpleArray, index: u64): u64 {
        if (index == 0) return arr.v0;
        if (index == 1) return arr.v1;
        if (index == 2) return arr.v2;
        if (index == 3) return arr.v3;
        if (index == 4) return arr.v4;
        if (index == 5) return arr.v5;
        if (index == 6) return arr.v6;
        if (index == 7) return arr.v7;
        if (index == 8) return arr.v8;
        0
    }
    
    public fun array_size(arr: &SimpleArray): u64 {
        arr.size
    }
    
    public fun all_test_steps(): SimpleArray {
        let results = create_array();
        
        let math_steps = test_math_verbose();
        add_to_array(&mut results, 1000); 
        add_to_array(&mut results, get_info_value(&math_steps.step1_initial_value));
        add_to_array(&mut results, get_info_value(&math_steps.step2_after_add));
        add_to_array(&mut results, get_info_value(&math_steps.step3_after_multiply));
        add_to_array(&mut results, get_info_value(&math_steps.step4_final_result));
        
        let counter_steps = test_counter_verbose();
        add_to_array(&mut results, 2000); 
        add_to_array(&mut results, get_info_value(&counter_steps.step1_initial));
        add_to_array(&mut results, get_info_value(&counter_steps.step2_after_first_increment));
        add_to_array(&mut results, get_info_value(&counter_steps.step3_after_second_increment));
        
        results
    }
}