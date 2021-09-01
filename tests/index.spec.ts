import Configurator from '../src/index';
import { CompareOperator } from '../src/enums';

describe('Configuration instantiates successfully', () => {
  test('not undefined', () => {
    expect(Configurator).not.toBeUndefined();
  });

  test('throws when not instantiated', () => {
    const staticReference = async () => {
      // @ts-ignore
      return Configurator();
    }
    expect(staticReference).rejects.toThrow('Configurator must be instantiated');
  });

  test('instantiates', () => {
    expect(new Configurator([], () => {})).not.toBeUndefined();
  });

  // test('fails when no context is provided', () => {
  //   expect(new Configurator()).not.toBeUndefined();
  // });

  describe('context tests', () => {
    test('sets context data correctly', () => {
      const generateContext = () => ({
        value1: 'one',
        value2: 'two',
      });

      const config = new Configurator([], generateContext);
      expect(config.context.value1).toBe('one');
      expect(config.context.value2).toBe('two');
    });
  });

  describe('rules tests', () => {
    test('rules with no conditions work', () => {
      const generateContext = () => ({
      });

      const rules = [
        {
          diff: {
            value1: 1,
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();
      expect(results.value1).toBe(1);
      expect(results.value2).toBeUndefined;
    });

    test('implicit conditional AND works', () => {
      const generateContext = () => ({
        group1: {
          item1: 'item',
        },
        value1: 'two',
        group2: {
          subgroup1: {
            item2: 5,
          },
        },
      });

      const rules = [
        {
          condition: [
            {
              key: 'group1.item1',
              test: 'item',
            },
            {
              key: 'value1',
              test: 'two',
            },
            {
              key: 'group2.subgroup1.item2',
              test: 5,
            },
          ],
          diff: {
            works: true,
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();
      expect(results.works).toBe(true);
      expect(results.missing).toBeUndefined();
    });

    test('top level explicit conditional OR works', () => {
      const generateContext = () => ({
        group2: {
          subgroup1: {
            item2: 5,
          },
        },
      });

      const rules = [
        {
          operator: 'or' as CompareOperator,
          condition: [
            {
              key: 'group1.item1',
              test: 'item',
            },
            {
              key: 'value1',
              test: 'two',
            },
            {
              key: 'group2.subgroup1.item2',
              test: 5,
            },
          ],
          diff: {
            works: true,
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();
      expect(results.works).toBe(true);
      expect(results.missing).toBeUndefined();
    });

    test('nested explicit conditional OR works', () => {
      const generateContext = () => ({
        group2: {
          subgroup1: {
            item2: 5,
          },
        },
      });

      const rules = [
        {
          condition: [
            {
              operator: 'or' as CompareOperator,
              test: [
                {
                  key: 'group1.item1',
                  test: 'item',
                },
                {
                  key: 'value1',
                  test: 'two',
                },
                {
                  key: 'group2.subgroup1.item2',
                  test: 5,
                },
              ]
            }
          ],
          diff: {
            works: true,
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();
      expect(results.works).toBe(true);
      expect(results.missing).toBeUndefined();
    });

    test('AND OR combination conditional works', () => {
      const generateContext = () => ({
        group1: {
          something: 'someValue',
        },
        group2: {
          subgroup1: {
            item2: true,
          },
        },
      });

      const rules = [
        {
          condition: [
            {
              key: 'group1.something',
              test: 'someValue',
            },
            {
              operator: 'or' as CompareOperator,
              test: [
                {
                  key: 'group1.item1',
                  test: 'item',
                },
                {
                  key: 'value1',
                  test: 'two',
                },
                {
                  key: 'group2.subgroup1.item2',
                  test: true,
                },
              ]
            }
          ],
          diff: {
            works: true,
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();
      expect(results.works).toBe(true);
      expect(results.missing).toBeUndefined();
    });

  });

  describe('diff merge tests', () => {
    test('top level merge diff works', () => {
      const generateContext = () => ({
        value1: true,
      });

      const rules = [
        {
          diff: {
            value1: 1,
            value2: 'two',
          }
        },
        {
          condition: [
            {
              key: 'value1',
              test: true,
            }
          ],
          diff: {
            value1: 2,
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();
      expect(results.value1).toBe(2);
      expect(results.value2).toBe('two');
    });

    test('nested override diff works', () => {
      const generateContext = () => ({
        value1: true,
      });

      const rules = [
        {
          diff: {
            group1: {
              value1: 1,
              value2: 2,
            },
          },
        },
        {
          condition: [
            {
              key: 'value1',
              test: true,
            }
          ],
          diff: {
            group1: {
              value3: 3,
            },
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();
      expect(results.group1.value3).toBe(3);
      expect(results.value2).toBeUndefined();
    });

    test('nested merge diff works', () => {
      const generateContext = () => ({
        value1: true,
      });

      const rules = [
        {
          diff: {
            group1: {
              value1: 1,
              value2: 2,
            },
          },
        },
        {
          condition: [
            {
              key: 'value1',
              test: true,
            }
          ],
          diff: {
            '+group1': {
              'value3': 3,
            },
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();

      expect(results.group1.value3).toBe(3);
      expect(results.group1.value1).toBe(1);
      expect(results.group1.value2).toBe(2);
    });

    test('top level remove diff works', () => {
      const generateContext = () => ({
        value1: true,
      });

      const rules = [
        {
          diff: {
            value1: 1,
            value2: 2,
          },
        },
        {
          condition: [
            {
              key: 'value1',
              test: true,
            }
          ],
          diff: {
            '-value2': false,
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();

      expect(results.value1).toBe(1);
      expect(results.value2).toBeUndefined();
    });

    test('nested remove diff works', () => {
      const generateContext = () => ({
        value1: true,
      });

      const rules = [
        {
          diff: {
            group1: {
              value1: 1,
              value2: 2,
            },
          },
        },
        {
          condition: [
            {
              key: 'value1',
              test: true,
            }
          ],
          diff: {
            '+group1': {
              '-value2': 2,
            },
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();

      expect(results.group1.value1).toBe(1);
      expect(results.group1.value2).toBeUndefined();
    });

    test('merge array works', () => {
      const generateContext = () => ({
        value1: true,
      });

      const rules = [
        {
          diff: {
            group1: [
              'item1',
            ],
          },
        },
        {
          condition: [
            {
              key: 'value1',
              test: true,
            }
          ],
          diff: {
            '+group1': [
              'item2',
            ],
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();

      expect(results.group1).toEqual(['item1', 'item2']);
    });

    test('remove from array works', () => {
      const generateContext = () => ({
        value1: true,
      });

      const rules = [
        {
          diff: {
            group1: [
              'item1',
              'item2',
              'item3',
            ],
          },
        },
        {
          condition: [
            {
              key: 'value1',
              test: true,
            }
          ],
          diff: {
            '-group1': [
              'item2',
            ],
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();

      expect(results.group1).toEqual(['item1', 'item3']);
    });

    test('remove array works', () => {
      const generateContext = () => ({
        value1: true,
      });

      const rules = [
        {
          diff: {
            item1: 1,
            group1: [
              'item1',
              'item2',
              'item3',
            ],
          },
        },
        {
          condition: [
            {
              key: 'value1',
              test: true,
            }
          ],
          diff: {
            '-group1': null,
          }
        }
      ];

      const config = new Configurator(rules, generateContext);
      const results = config.getConfiguration();

      expect(results).toEqual({ item1: 1});
    });
  });
});
